#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec,
};

// Storage key for the list of all sensor IDs
const ALL_IDS_KEY: &str = "all_ids";

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SensorInfo {
    pub owner: Address,
    pub endpoint_url: String,
    pub price_stroops: i128,
    pub description: String,
    pub active: bool,
    pub registered_at: u64,
}

#[contract]
pub struct SensorRegistry;

#[contractimpl]
impl SensorRegistry {
    /// Register a new sensor. Caller must authenticate.
    pub fn register_sensor(
        env: Env,
        caller: Address,
        sensor_id: Symbol,
        endpoint_url: String,
        price_stroops: i128,
        description: String,
    ) {
        caller.require_auth();

        let sensor = SensorInfo {
            owner: caller.clone(),
            endpoint_url,
            price_stroops,
            description,
            active: true,
            registered_at: env.ledger().timestamp(),
        };

        env.storage().instance().set(&sensor_id, &sensor);

        // Maintain list of all sensor IDs
        let ids_key = Symbol::new(&env, ALL_IDS_KEY);
        let mut ids: Vec<Symbol> = env
            .storage()
            .instance()
            .get(&ids_key)
            .unwrap_or(Vec::new(&env));

        // Only add if not already present
        let mut found = false;
        for i in 0..ids.len() {
            if ids.get(i).unwrap() == sensor_id {
                found = true;
                break;
            }
        }
        if !found {
            ids.push_back(sensor_id.clone());
            env.storage().instance().set(&ids_key, &ids);
        }

        env.events().publish(
            (Symbol::new(&env, "sensor_registered"), sensor_id),
            caller,
        );
    }

    /// Get sensor info by ID.
    pub fn get_sensor(env: Env, sensor_id: Symbol) -> SensorInfo {
        env.storage()
            .instance()
            .get(&sensor_id)
            .expect("Sensor not found")
    }

    /// List all active sensor IDs.
    pub fn list_sensors(env: Env) -> Vec<Symbol> {
        let ids_key = Symbol::new(&env, ALL_IDS_KEY);
        let all_ids: Vec<Symbol> = env
            .storage()
            .instance()
            .get(&ids_key)
            .unwrap_or(Vec::new(&env));

        let mut active_ids = Vec::new(&env);
        for i in 0..all_ids.len() {
            let id = all_ids.get(i).unwrap();
            if let Some(sensor) = env.storage().instance().get::<Symbol, SensorInfo>(&id) {
                if sensor.active {
                    active_ids.push_back(id);
                }
            }
        }
        active_ids
    }

    /// Deactivate a sensor. Only the owner can do this.
    pub fn deactivate(env: Env, caller: Address, sensor_id: Symbol) {
        caller.require_auth();

        let mut sensor: SensorInfo = env
            .storage()
            .instance()
            .get(&sensor_id)
            .expect("Sensor not found");

        assert!(caller == sensor.owner, "Not the owner");

        sensor.active = false;
        env.storage().instance().set(&sensor_id, &sensor);

        env.events().publish(
            (Symbol::new(&env, "sensor_deactivated"), sensor_id),
            caller,
        );
    }

    /// Verify that a payment amount is sufficient for a sensor.
    /// Returns true if the sensor is active AND paid_stroops >= price.
    pub fn verify_payment_amount(env: Env, sensor_id: Symbol, paid_stroops: i128) -> bool {
        let sensor: SensorInfo = env
            .storage()
            .instance()
            .get(&sensor_id)
            .expect("Sensor not found");

        sensor.active && paid_stroops >= sensor.price_stroops
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    fn setup_contract() -> (Env, SensorRegistryClient<'static>, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(SensorRegistry, ());
        let client = SensorRegistryClient::new(&env, &contract_id);
        let owner = Address::generate(&env);
        (env, client, owner)
    }

    #[test]
    fn test_register_and_get_sensor() {
        let (env, client, owner) = setup_contract();

        let sensor_id = Symbol::new(&env, "sensor_001");
        let endpoint = String::from_str(&env, "http://localhost:3001");
        let price: i128 = 50_000;
        let description = String::from_str(&env, "Temperatura vinedo Valle de Uco");

        client.register_sensor(
            &owner,
            &sensor_id,
            &endpoint,
            &price,
            &description,
        );

        let info = client.get_sensor(&sensor_id);
        assert_eq!(info.owner, owner);
        assert_eq!(info.endpoint_url, endpoint);
        assert_eq!(info.price_stroops, price);
        assert_eq!(info.description, description);
        assert!(info.active);
    }

    #[test]
    fn test_list_sensors() {
        let (env, client, owner) = setup_contract();

        client.register_sensor(
            &owner,
            &Symbol::new(&env, "s1"),
            &String::from_str(&env, "http://localhost:3001"),
            &50_000i128,
            &String::from_str(&env, "Sensor 1"),
        );
        client.register_sensor(
            &owner,
            &Symbol::new(&env, "s2"),
            &String::from_str(&env, "http://localhost:3002"),
            &50_000i128,
            &String::from_str(&env, "Sensor 2"),
        );

        let sensors = client.list_sensors();
        assert_eq!(sensors.len(), 2);
    }

    #[test]
    fn test_deactivate_only_owner() {
        let (env, client, owner) = setup_contract();

        let sensor_id = Symbol::new(&env, "sensor_001");
        client.register_sensor(
            &owner,
            &sensor_id,
            &String::from_str(&env, "http://localhost:3001"),
            &50_000i128,
            &String::from_str(&env, "Temp sensor"),
        );

        // Owner can deactivate
        client.deactivate(&owner, &sensor_id);
        let info = client.get_sensor(&sensor_id);
        assert!(!info.active);

        // Deactivated sensor should not appear in list
        let sensors = client.list_sensors();
        assert_eq!(sensors.len(), 0);
    }

    #[test]
    #[should_panic(expected = "Not the owner")]
    fn test_deactivate_non_owner_panics() {
        let (env, client, owner) = setup_contract();

        let sensor_id = Symbol::new(&env, "sensor_001");
        client.register_sensor(
            &owner,
            &sensor_id,
            &String::from_str(&env, "http://localhost:3001"),
            &50_000i128,
            &String::from_str(&env, "Temp sensor"),
        );

        // Non-owner cannot deactivate
        let other = Address::generate(&env);
        client.deactivate(&other, &sensor_id);
    }

    #[test]
    fn test_verify_payment_amount_correct() {
        let (env, client, owner) = setup_contract();

        let sensor_id = Symbol::new(&env, "sensor_001");
        client.register_sensor(
            &owner,
            &sensor_id,
            &String::from_str(&env, "http://localhost:3001"),
            &50_000i128,
            &String::from_str(&env, "Temp sensor"),
        );

        // Exact amount — should pass
        assert!(client.verify_payment_amount(&sensor_id, &50_000i128));
        // More than enough — should pass
        assert!(client.verify_payment_amount(&sensor_id, &100_000i128));
    }

    #[test]
    fn test_verify_payment_amount_insufficient() {
        let (env, client, owner) = setup_contract();

        let sensor_id = Symbol::new(&env, "sensor_001");
        client.register_sensor(
            &owner,
            &sensor_id,
            &String::from_str(&env, "http://localhost:3001"),
            &50_000i128,
            &String::from_str(&env, "Temp sensor"),
        );

        // Less than required — should fail
        assert!(!client.verify_payment_amount(&sensor_id, &49_999i128));
        assert!(!client.verify_payment_amount(&sensor_id, &0i128));
    }

    #[test]
    fn test_verify_payment_inactive_sensor() {
        let (env, client, owner) = setup_contract();

        let sensor_id = Symbol::new(&env, "sensor_001");
        client.register_sensor(
            &owner,
            &sensor_id,
            &String::from_str(&env, "http://localhost:3001"),
            &50_000i128,
            &String::from_str(&env, "Temp sensor"),
        );

        client.deactivate(&owner, &sensor_id);

        // Even with correct amount, inactive sensor returns false
        assert!(!client.verify_payment_amount(&sensor_id, &50_000i128));
    }
}

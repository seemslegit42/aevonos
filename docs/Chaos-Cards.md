### **Chaos Card Metadata Schema v1.1**

This schema defines the complete set of attributes for any Chaos Card object within the ΛΞVON OS ecosystem. It is designed for precision, scalability, and seamless integration with all core agents including BEEP, Aegis, KLEPSYDRA, and Obelisk Pay.

-----

#### **I. Identification & Lore**

*(Defines what the card IS)*

| Field Name | Data Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `card_id` | String | A unique, immutable UUID for the card instance. Generated at the moment of its creation (minting). | `"cc-uuid-a1b2-c3d4-e5f6"` |
| `archetype_id` | String | The static identifier for the *type* of card. All "Weeping Glass" cards share this ID. | `"aesthetic_weeping_glass_v1"` |
| `card_name` | String | The human-readable name of the card, displayed in the UI. | `"Weeping Glass"` |
| `class` | Enum | The primary category of the card's effect. Governs its general purpose. | `AESTHETIC` |
| | | *Values: `AESTHETIC`, `AGENTIC`, `SYSTEMIC`, `SYNDICATE`* | |
| `rarity` | Enum | The drop-rate and perceived value of the card, used by the KLEPSYDRA rarity tables. | `COMMON` |
| | | *Values: `COMMON`, `UNCOMMON`, `RARE`, `MYTHIC`* | |
| `flavor_text` | String | The poetic, mythos-aligned text that gives the card its soul. Displayed to the user. | `"A reminder that even structure is fluid."` |

-----

#### **II. Economic & State Management**

*(Defines the card's lifecycle and cost)*

| Field Name | Data Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `cost_credits` | Integer | The cost in `ΞCredits` to purchase or activate the card. Read by Obelisk Pay. `0` if it's a reward. | `50` |
| `is_tradable` | Boolean | Defines if the card can be traded between users in a future Syndicate Marketplace. | `true` |
| `is_stackable` | Boolean | Can multiple instances of this card's effect be active simultaneously? | `false` |
| `is_consumed` | Boolean | Is the card destroyed after a single use? | `true` |
| `state` | Enum | The current state of this specific card instance. | `IN_INVENTORY` |
| | | *Values: `IN_INVENTORY`, `ACTIVE`, `EXPIRED`, `CONSUMED`* | |
| `schema_version`| String | The version of this metadata schema, for future-proofing and migrations. | `"1.1"` |

-----

#### **III. Core Mechanics & Effect**

*(Defines what the card DOES. This is the heart of the schema.)*

This is a nested JSON object defining the card's function.

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `effect` | Object | The container for all functional parameters. |
| `effect.type` | Enum | The specific type of action the card performs. Determines which part of the OS will execute the logic. |
| | | *Values: `UI_MOD`, `AGENT_BEHAVIOR`, `ODDS_MOD`, `SYSTEM_EVENT`, `RESOURCE_GRANT`* |
| `effect.target` | String | The specific target of the effect. Can be a system name, an agent name, or a user state. |
| | | *Examples: `system.canvas`, `agent.beep`, `engine.klepsydra`, `user.self`* |
| `effect.duration_seconds`| Integer | The duration of the effect in seconds. `0` for instantaneous effects. `-1` for permanent effects. |
| `effect.parameters` | Object | A flexible key-value store for the specific parameters of the effect. This is what makes the system endlessly extensible. |

-----

### **Concrete Examples**

**Example 1: A Common, Aesthetic Card**

```json
{
  "card_id": "cc-uuid-a1b2-c3d4-e5f6",
  "archetype_id": "aesthetic_weeping_glass_v1",
  "card_name": "Weeping Glass",
  "class": "AESTHETIC",
  "rarity": "COMMON",
  "flavor_text": "A reminder that even structure is fluid.",
  "cost_credits": 50,
  "is_tradable": true,
  "is_stackable": false,
  "is_consumed": true,
  "state": "IN_INVENTORY",
  "schema_version": "1.1",
  "effect": {
    "type": "UI_MOD",
    "target": "system.canvas",
    "duration_seconds": 900,
    "parameters": {
      "shader_effect": "weeping_glass_vfx",
      "intensity": 0.7
    }
  }
}
```

**Example 2: A Rare, Systemic Card for the Mercenary**

```json
{
  "card_id": "cc-uuid-b4n8-x9y1-z2a3",
  "archetype_id": "systemic_loaded_die_v1",
  "card_name": "The Loaded Die",
  "class": "SYSTEMIC",
  "rarity": "RARE",
  "flavor_text": "The Fates can be... persuaded.",
  "cost_credits": 5000,
  "is_tradable": false,
  "is_stackable": false,
  "is_consumed": true,
  "state": "IN_INVENTORY",
  "schema_version": "1.1",
  "effect": {
    "type": "ODDS_MOD",
    "target": "engine.klepsydra",
    "duration_seconds": 0,
    "parameters": {
      "target_instrument_class": "all",
      "tribute_count": 3,
      "win_chance_modifier": 1.15 
    }
  }
}
```
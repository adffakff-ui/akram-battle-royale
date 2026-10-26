using UnityEngine;

namespace BattleRoyale.Inventory
{
    public enum LootType { Weapon, HealthKit, Ammo, Armor }

    public class LootItem : MonoBehaviour
    {
        public string itemName;
        public LootType itemType;
        public float itemValue;
        public float pickupRange = 3.0f;
        private Transform player;

        void Start()
        {
            GameObject playerObj = GameObject.FindGameObjectWithTag("Player");
            if (playerObj != null) player = playerObj.transform;
        }

        void Update()
        {
            if (player == null) return;

            if (Vector3.Distance(transform.position, player.position) <= pickupRange)
            {
                PickUpLoot();
            }
        }

        void PickUpLoot()
        {
            PlayerInventory inventory = player.GetComponent<PlayerInventory>();
            if (inventory != null)
            {
                inventory.AddItem(this);
                Destroy(gameObject);
            }
        }
    }
}

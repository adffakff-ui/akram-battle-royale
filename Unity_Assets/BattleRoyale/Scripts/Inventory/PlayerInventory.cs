using System.Collections.Generic;
using UnityEngine;
using BattleRoyale.Combat;

namespace BattleRoyale.Inventory
{
    public class PlayerInventory : MonoBehaviour
    {
        public int maxCapacity = 5;
        public List<LootItem> collectedItems = new List<LootItem>();

        private HealthSystem playerHealth;

        void Start()
        {
            playerHealth = GetComponent<HealthSystem>();
        }

        public void AddItem(LootItem item)
        {
            if (collectedItems.Count < maxCapacity)
            {
                collectedItems.Add(item);
                Debug.Log("Item added: " + item.itemName);
            }
            else
            {
                Debug.Log("Inventory Full!");
            }
        }

        public void UseItem(int index)
        {
            if (index >= 0 && index < collectedItems.Count)
            {
                LootItem item = collectedItems[index];
                if (item.itemType == LootType.HealthKit && playerHealth != null)
                {
                    playerHealth.TakeDamage(-item.itemValue);
                    collectedItems.RemoveAt(index);
                }
            }
        }
    }
}

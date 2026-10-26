using UnityEngine;
using UnityEngine.UI;

namespace BattleRoyale.Combat
{
    public class HealthSystem : MonoBehaviour
    {
        [Header("Health Settings")]
        public float maxHealth = 100f;
        [SerializeField] private float currentHealth;

        [Header("UI Reference")]
        public Slider healthSlider;

        void Start()
        {
            currentHealth = maxHealth;
            UpdateHealthUI();
        }

        public void TakeDamage(float amount)
        {
            currentHealth -= amount;
            currentHealth = Mathf.Clamp(currentHealth, 0, maxHealth);
            UpdateHealthUI();

            if (currentHealth <= 0) Die();
        }

        void UpdateHealthUI()
        {
            if (healthSlider != null)
            {
                healthSlider.value = currentHealth / maxHealth;
            }
        }

        void Die()
        {
            if (gameObject.CompareTag("Player"))
            {
                Debug.Log("Player eliminated!");
            }
            else
            {
                Destroy(gameObject, 0.5f);
            }
        }
    }
}

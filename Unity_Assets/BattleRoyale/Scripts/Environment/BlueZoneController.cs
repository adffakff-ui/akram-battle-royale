using UnityEngine;
using BattleRoyale.Combat;

namespace BattleRoyale.Environment
{
    public class BlueZoneController : MonoBehaviour
    {
        public float shrinkSpeed = 1f;
        public float minScale = 5f;
        public float damageInterval = 1f;
        public float zoneDamage = 10f;

        private float nextDamageTime;
        private Transform player;

        void Start()
        {
            GameObject playerObj = GameObject.FindGameObjectWithTag("Player");
            if (playerObj != null) player = playerObj.transform;
        }

        void Update()
        {
            if (transform.localScale.x > minScale)
            {
                float newScale = transform.localScale.x - (shrinkSpeed * Time.deltaTime);
                transform.localScale = new Vector3(newScale, transform.localScale.y, newScale);
            }

            CheckPlayerPosition();
        }

        void CheckPlayerPosition()
        {
            if (player == null) return;

            float distanceFromCenter = Vector3.Distance(
                new Vector3(transform.position.x, 0, transform.position.z),
                new Vector3(player.position.x, 0, player.position.z)
            );

            if (distanceFromCenter > transform.localScale.x / 2f)
            {
                ApplyZoneDamage();
            }
        }

        void ApplyZoneDamage()
        {
            if (Time.time >= nextDamageTime)
            {
                nextDamageTime = Time.time + damageInterval;
                HealthSystem playerHealth = player.GetComponent<HealthSystem>();
                if (playerHealth != null) playerHealth.TakeDamage(zoneDamage);
            }
        }
    }
}

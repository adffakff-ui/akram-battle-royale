using UnityEngine;

namespace BattleRoyale.Combat
{
    public class MobileWeaponController : MonoBehaviour
    {
        [Header("UI Reference")]
        public MobileShootButton shootButton;

        [Header("Weapon Settings")]
        public float fireRate = 0.15f;
        private float nextFireTime = 0f;
        public float range = 100f;
        public float damage = 25f;

        void Update()
        {
            if (shootButton != null && shootButton.isShooting)
            {
                if (Time.time >= nextFireTime)
                {
                    nextFireTime = Time.time + fireRate;
                    Shoot();
                }
            }
        }

        void Shoot()
        {
            Ray ray = new Ray(Camera.main.transform.position, Camera.main.transform.forward);
            RaycastHit hit;

            if (Physics.Raycast(ray, out hit, range))
            {
                HealthSystem targetHealth = hit.collider.GetComponent<HealthSystem>();
                if (targetHealth != null)
                {
                    targetHealth.TakeDamage(damage);
                }
            }
        }
    }
}

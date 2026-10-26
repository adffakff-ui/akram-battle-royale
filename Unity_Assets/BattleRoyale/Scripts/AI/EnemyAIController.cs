using UnityEngine;
using UnityEngine.AI;
using BattleRoyale.Combat;

namespace BattleRoyale.AI
{
    public class EnemyAIController : MonoBehaviour
    {
        private NavMeshAgent agent;
        private Transform player;

        public float detectionRange = 15f;
        public float attackRange = 3f;
        public float attackCooldown = 2f;
        private float lastAttackTime;

        void Start()
        {
            agent = GetComponent<NavMeshAgent>();
            GameObject playerObj = GameObject.FindGameObjectWithTag("Player");
            if (playerObj != null) player = playerObj.transform;
        }

        void Update()
        {
            if (player == null) return;

            float distance = Vector3.Distance(transform.position, player.position);
            if (distance <= detectionRange)
            {
                agent.SetDestination(player.position);
                if (distance <= attackRange) AttackPlayer();
            }
            else
            {
                agent.SetDestination(transform.position);
            }
        }

        void AttackPlayer()
        {
            if (Time.time >= lastAttackTime + attackCooldown)
            {
                lastAttackTime = Time.time;
                HealthSystem playerHealth = player.GetComponent<HealthSystem>();
                if (playerHealth != null) playerHealth.TakeDamage(10f);
            }
        }
    }
}

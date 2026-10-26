using UnityEngine;
using UnityEngine.AI;
using BattleRoyale.Combat;

namespace BattleRoyale.AI
{
    public class EnemyAIController : MonoBehaviour
    {
        private NavMeshAgent agent;
        private Transform player;
        private HealthSystem enemyHealth;

        public float detectionRange = 18f;
        public float attackRange = 4f;
        public float retreatHealthThreshold = 35f;
        public float attackCooldown = 1.8f;
        private float lastAttackTime;

        private enum AIState { Patrol, Chase, Attack, RetreatToCover }
        private AIState currentState = AIState.Patrol;

        void Start()
        {
            agent = GetComponent<NavMeshAgent>();
            enemyHealth = GetComponent<HealthSystem>();
            GameObject playerObj = GameObject.FindGameObjectWithTag("Player");
            if (playerObj != null) player = playerObj.transform;
        }

        void Update()
        {
            if (player == null) return;

            float currentHp = enemyHealth != null ? enemyHealth.currentHealth : 100f;
            float distanceToPlayer = Vector3.Distance(transform.position, player.position);

            // 1. Smart Retreat Behavior when Health is Low (< 35%)
            if (currentHp <= retreatHealthThreshold)
            {
                currentState = AIState.RetreatToCover;
                FindAndMoveToCover();
                return;
            }

            // 2. Standard Detection & Chase / Attack Logic
            if (distanceToPlayer <= detectionRange)
            {
                if (distanceToPlayer <= attackRange)
                {
                    currentState = AIState.Attack;
                    agent.SetDestination(transform.position); // Hold position / aim
                    AttackPlayer();
                }
                else
                {
                    currentState = AIState.Chase;
                    agent.SetDestination(player.position);
                }
            }
            else
            {
                currentState = AIState.Patrol;
                agent.SetDestination(transform.position);
            }
        }

        void FindAndMoveToCover()
        {
            // Search for nearby cover objects or move backwards away from player
            Vector3 awayFromPlayer = (transform.position - player.position).normalized;
            Vector3 coverPosition = transform.position + (awayFromPlayer * 8f) + new RandomVectorOffset();
            
            agent.SetDestination(coverPosition);
            Debug.Log("🛡️ Smart AI: Low health! Retreating to tactical cover.");
        }

        Vector3 RandomVectorOffset()
        {
            return new Vector3(Random.Range(-4f, 4f), 0, Random.Range(-4f, 4f));
        }

        void AttackPlayer()
        {
            if (Time.time >= lastAttackTime + attackCooldown)
            {
                lastAttackTime = Time.time;
                HealthSystem playerHealth = player.GetComponent<HealthSystem>();
                if (playerHealth != null) playerHealth.TakeDamage(12f);
            }
        }
    }
}

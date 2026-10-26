using UnityEngine;

namespace BattleRoyale.Player
{
    [RequireComponent(typeof(CharacterController))]
    public class MobilePlayerController : MonoBehaviour
    {
        private CharacterController controller;
        private Vector3 playerVelocity;
        private bool groundedPlayer;

        [Header("Movement Settings")]
        public float playerSpeed = 5.0f;
        public float gravityValue = -9.81f;

        [Header("Joystick Reference")]
        public SimpleJoystick movementJoystick;

        void Start()
        {
            controller = GetComponent<CharacterController>();
        }

        void Update()
        {
            groundedPlayer = controller.isGrounded;
            if (groundedPlayer && playerVelocity.y < 0)
            {
                playerVelocity.y = 0f;
            }

            float moveX = movementJoystick != null ? movementJoystick.Horizontal : Input.GetAxis("Horizontal");
            float moveZ = movementJoystick != null ? movementJoystick.Vertical : Input.GetAxis("Vertical");

            Vector3 move = new Vector3(moveX, 0, moveZ);
            controller.Move(move * playerSpeed * Time.deltaTime);

            if (move != Vector3.zero)
            {
                gameObject.transform.forward = move;
            }

            playerVelocity.y += gravityValue * Time.deltaTime;
            controller.Move(playerVelocity * Time.deltaTime);
        }
    }
}

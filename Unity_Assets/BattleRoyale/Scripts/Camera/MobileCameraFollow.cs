using UnityEngine;

namespace BattleRoyale.CameraControl
{
    public class MobileCameraFollow : MonoBehaviour
    {
        [Header("Target Settings")]
        public Transform target;
        public Vector3 offset = new Vector3(0f, 2.5f, -4f);
        public float smoothSpeed = 10f;

        [Header("Touch Rotation Settings")]
        public float sensitivity = 0.4f;
        private float currentX = 0f;
        private float currentY = 15f;
        public float minYAngle = -10f;
        public float maxYAngle = 50f;

        void LateUpdate()
        {
            if (target == null) return;

            if (Input.touchCount > 0)
            {
                Touch touch = Input.GetTouch(0);
                if (touch.position.x > Screen.width / 2)
                {
                    if (touch.phase == TouchPhase.Moved)
                    {
                        currentX += touch.deltaPosition.x * sensitivity;
                        currentY -= touch.deltaPosition.y * sensitivity;
                        currentY = Mathf.Clamp(currentY, minYAngle, maxYAngle);
                    }
                }
            }

            #if UNITY_EDITOR
            if (Input.GetMouseButton(0) && Input.mousePosition.x > Screen.width / 2)
            {
                currentX += Input.GetAxis("Mouse X") * sensitivity * 10f;
                currentY -= Input.GetAxis("Mouse Y") * sensitivity * 10f;
                currentY = Mathf.Clamp(currentY, minYAngle, maxYAngle);
            }
            #endif

            Quaternion rotation = Quaternion.Euler(currentY, currentX, 0);
            Vector3 desiredPosition = target.position + rotation * offset;

            transform.position = Vector3.Lerp(transform.position, desiredPosition, smoothSpeed * Time.deltaTime);
            transform.LookAt(target.position + Vector3.up * 1.5f);
        }
    }
}

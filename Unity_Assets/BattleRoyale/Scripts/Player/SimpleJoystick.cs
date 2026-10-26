using UnityEngine;
using UnityEngine.EventSystems;

namespace BattleRoyale.Player
{
    public class SimpleJoystick : MonoBehaviour, IDragHandler, IPointerUpHandler, IPointerDownHandler
    {
        [HideInInspector] public float Horizontal;
        [HideInInspector] public float Vertical;

        public void OnPointerDown(PointerEventData eventData) => OnDrag(eventData);

        public void OnDrag(PointerEventData eventData)
        {
            Vector2 position;
            if (RectTransformUtility.ScreenPointToLocalPointInRectangle(
                transform as RectTransform, eventData.position, eventData.pressEventCamera, out position))
            {
                position.x = (position.x / (transform.GetComponent<RectTransform>().sizeDelta.x));
                position.y = (position.y / (transform.GetComponent<RectTransform>().sizeDelta.y));

                Horizontal = Mathf.Clamp(position.x * 2, -1f, 1f);
                Vertical = Mathf.Clamp(position.y * 2, -1f, 1f);
            }
        }

        public void OnPointerUp(PointerEventData eventData)
        {
            Horizontal = 0;
            Vertical = 0;
        }
    }
}

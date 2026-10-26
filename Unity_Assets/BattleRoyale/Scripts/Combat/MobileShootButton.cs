using UnityEngine;
using UnityEngine.EventSystems;

namespace BattleRoyale.Combat
{
    public class MobileShootButton : MonoBehaviour, IPointerDownHandler, IPointerUpHandler
    {
        [HideInInspector] public bool isShooting = false;

        public void OnPointerDown(PointerEventData eventData) => isShooting = true;
        public void OnPointerUp(PointerEventData eventData) => isShooting = false;
    }
}

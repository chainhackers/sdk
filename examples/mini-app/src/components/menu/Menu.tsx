import React, { useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import closeIcon from '../../assets/game/close.svg';
import styles from './Menu.module.css';

export interface MenuProps {
  isOpen: boolean;
  onClickClose: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

const overlayClassNames = {
  enter: styles.menu_overlay__enter,
  enterActive: styles.menu_overlay__enter_active,
  exit: styles.menu_overlay__exit,
  exitActive: styles.menu_overlay__exit_active,
};

const windowClassNames = {
  enter: styles.menu_popup__enter,
  enterActive: styles.menu_popup__enter_active,
  exit: styles.menu_popup__exit,
  exitActive: styles.menu_popup__exit_active,
};

export function Menu({
  isOpen,
  onClickClose,
  children
}: MenuProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <CSSTransition
        nodeRef={overlayRef}
        in={isOpen}
        timeout={300}
        classNames={{...overlayClassNames}}
        mountOnEnter
        unmountOnExit
      >
        <div
          ref={overlayRef}
          className={styles.menu_overlay}
          onClick={() => onClickClose(false)}
        />
      </CSSTransition>
      <CSSTransition
        nodeRef={popupRef}
        in={isOpen}
        timeout={300}
        classNames={{...windowClassNames}}
        mountOnEnter
        unmountOnExit
      >
        <div
          ref={popupRef}
          className={styles.menu_popup}
        >
          <button
            className={styles.menu_close_btn}
            onClick={() => onClickClose(false)}
          >
            <img src={closeIcon} alt="close menu" />
          </button>
          {children}
        </div>
      </CSSTransition>
    </>
  );
}

export enum ModalActionTypes {
    ToggleLoginModal = "TOGGLE_LOGIN_MODAL",
    ToggleRegisterModal = "TOGGLE_REGISTER_MODAL",
    ToggleForgotPasswordModal = "TOGGLE_FORGOT_PASSWORD_MODAL",
    ToggleUserInfoModal = "TOGGLE_USER_INFO_MODAL",
    ToggleShareWithModal = "TOGGLE_SHARE_WITH_MODAL",
    ResetTogglesModal = "RESET_TOGGLES_MODAL"
};

export interface ModalState {
    toggleRegisterModal: boolean;
    toggleLoginModal: boolean;
    toggleForgotPasswordModal: boolean;
    toggleUserInfoModal: boolean;
    toggleShareWithModal: boolean;
};
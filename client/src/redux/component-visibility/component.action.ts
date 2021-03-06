import { ComponentActionTypes } from "./component.types";

export interface IComponentBaseAction {
    type: ComponentActionTypes;
}

export interface IToggleUpload extends IComponentBaseAction {
    type: ComponentActionTypes.ToogleUploadComponent;
}

export interface IToggleMyFiles extends IComponentBaseAction {
    type: ComponentActionTypes.ToogleMyFilesComponent
}
export interface IToggleShared extends IComponentBaseAction {
    type: ComponentActionTypes.ToggleSharedComponent
}

export type TComponentReducerActions = IToggleUpload | IToggleMyFiles | IToggleShared;
import {NgModule} from "@angular/core";
import {LocationPickerComponent} from "./pickers/location-picker/location-picker.component";
import {MapModalComponent} from "./map-modal/map-modal.component";
import {CommonModule} from "@angular/common";
import {IonicModule} from "@ionic/angular";
import {GoogleMapsModule} from "@angular/google-maps";

@NgModule({
  declarations: [LocationPickerComponent, MapModalComponent],
  imports: [CommonModule, IonicModule, GoogleMapsModule],
  exports: [LocationPickerComponent, MapModalComponent],
})
export class SharedModule {}
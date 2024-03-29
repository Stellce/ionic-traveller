import { Component, OnInit } from '@angular/core';
import {AuthService} from "./auth.service";
import {Router} from "@angular/router";
import {AlertController, IonIcon, IonInput, LoadingController} from "@ionic/angular";
import {NgForm} from "@angular/forms";
import {Observable} from "rxjs";
import {AuthResponseData} from "./authResponseData.model";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;
  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
    ) {}

  ngOnInit() {
  }

  authenticate(email: string, password: string) {
    this.isLoading = true;
    this.loadingCtrl
      .create({keyboardClose: true, message: 'Logging in...'})
      .then(loadingEl => {
        loadingEl.present();
        let authObs: Observable<AuthResponseData>
        if(this.isLogin) {
          authObs = this.authService.login(email, password);
        } else {
          authObs = this.authService.signup(email, password);
        }
        authObs.subscribe({
          next: resData => {
            console.log(resData);
            this.isLoading = false;
            loadingEl.dismiss();
            this.router.navigateByUrl('/places/discover');
          },
          error: errRes => {
            console.log(errRes)
            loadingEl.dismiss();
            const code = errRes.error.error.message;
            let message = 'Could not sign up, try again';
            if(code === 'EMAIL_EXISTS') {
              message = 'This email address exists already!';
            } else if (code === 'INVALID_LOGIN_CREDENTIALS') {
              message = 'Password or login is not correct';
            }
            this.showAlert(message);
          }
        });
      });
  }

  changePasswordVisibility(passwordInput: IonInput, eyeIcon: IonIcon) {
    let isVisiblie = passwordInput.type === 'text';
    if (isVisiblie) {
      passwordInput.type = 'password';
      eyeIcon.name = 'eye-off';
      return;
    }
    passwordInput.type = 'text';
    eyeIcon.name = 'eye';
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(form: NgForm) {
    if (form.invalid) return;
    const email = form.value.email;
    const password = form.value.password;

    this.authenticate(email, password);
    form.reset();
  }

  private showAlert(message: string) {
    this.alertCtrl.create({
      header: 'Authentication failed',
      message: message,
      buttons: ['Okay']
    }).then(alertEl =>
      alertEl.present()
    )
  }
}

import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { LearnPage } from '../learn/learn';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  aqi: any;
  city: any;
  constructor(public loader: LoadingController, public navCtrl: NavController, public navParams: NavParams, public http: Http, private alertCtrl: AlertController) {
    this.http = http;
    this.loader = loader;
    this.aqi = { data: { iaqi: { pm25: {}, pm10: {}, no2: {}, so2: {} } } };
    this.city = this.navParams.data;
    this.reload();
  }
  reload() {
    let loading = this.loader.create({
      spinner: 'dots',
      content: 'Loading',
      duration: 60000
    });

    loading.present();

    let city_name = this.city.name || 'here';
    let url = 'https://api.waqi.info/feed/' + city_name + '/?token=0d6fe4d14e1317da3d08c85327831f634082b3df';
    this.http.get(url)
      .toPromise()
      .then(response => {
        loading.dismiss();
        if (response.json().status === 'nug') {
          // retry
          this.reload();
          return;
        }
        if (response.json().status !== 'ok') {
          let alert = this.alertCtrl.create({
            title: 'Error',
            subTitle: 'Could not get data',
            buttons: ['Ok']
          });
          alert.present();
          return;
        }
        this.aqi = response.json();

      })
      .catch(error => {
        loading.dismiss();
        console.log(error.json())
        let eloading = this.loader.create({
          content: 'Connectivity Issue!',
          duration: 5000
        });
        eloading.present();
      });
  }
  aqiStatus(val) {

    if (val <= 50) {
      return { code: 'good', val: 'Good' };
    } else if (val <= 100) {
      return { code: 'mod', val: 'Moderate' };
    } else if (val <= 200) {
      return { code: 'unhealthy', val: 'Unhealthy' };
    } if (val <= 300) {
      return { code: 'vunhealthy', val: 'Very Unhealthy' };
    } else if (val > 300) {
      return { code: 'hazardous', val: 'Hazardous' };
    } else {
      return { code: '', val: '' }
    }
  }
  openLearnPage() {
    // Nav push so we can use back button
    this.navCtrl.push(LearnPage);
  }
}

/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-trailing-spaces */
import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { PerformanceModalComponent } from '../../performance-modal/performance-modal.component';
import { Performance } from '../../performance.model';
import { PerformancesService } from '../../performances.service';
import { UserReservationsService } from '../../user-reservations.service';

@Component({
  selector: 'app-performance-details',
  templateUrl: './performance-details.page.html',
  styleUrls: ['./performance-details.page.scss'],
})
export class PerformanceDetailsPage implements OnInit {

  performance: Performance;
  date: Date;
  currentDate: Date = new Date();
  isLoading = false;
  itemExpanded: boolean = false;
  itemExpandedHeight: number = 0;

  constructor(
    private route: ActivatedRoute,
    private performancesService: PerformancesService,
    private router: Router,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    public authService: AuthService,
    private userReservationsService: UserReservationsService,
    private toastCtrl: ToastController) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('performanceId')) {
        this.navCtrl.navigateBack('/performances/tabs/repertoire');
        return;
      }

      this.isLoading = true;

      this.performancesService
        .getPerformance(paramMap.get('performanceId'))
        .subscribe((performance) => {
          this.performance = performance;
          this.isLoading = false;
        });
    });

  }

  expandItem() {
    this.itemExpanded = !this.itemExpanded;
    console.log(this.itemExpanded);
  }

  onDeletePerformance(){
    this.alertCtrl.create({header: 'Brisanje',
        message: 'Da li ste sigurni da želite da obrišete ovu predstavu?',
        buttons: [{
          text: 'Odustani',
          role: 'cancel'
        }, {
          text: 'Obriši',
          handler: () => {
            this.performancesService.deletePerformance(this.performance.id).subscribe(() => {
              this.navCtrl.navigateBack('/performances/tabs/repertoire');
            });
          }
        }]
      }).then(alertEl => {
        alertEl.present();
      });
  }

  onEditPerformance() {
    this.modalCtrl
      .create({
        component: PerformanceModalComponent,
        componentProps: {
            name: this.performance.name,
            description: this.performance.description, date: this.performance.date,
            place: this.performance.place, price: this.performance.price,
            actors: this.performance.actors, imageUrl: this.performance.imageUrl},
      })
      .then((modal) => {
        modal.present();
        return modal.onDidDismiss();
      })
      .then((resultData) => {
        if (resultData.role === 'confirm') {
          this.loadingCtrl
            .create({message: 'Čuvanje...'})
            .then((loadingEl) => {
              loadingEl.present();
              this.performancesService
                .editPerformance(
                  this.performance.id,
                  resultData.data.performanceData.name,
                  resultData.data.performanceData.description,
                  resultData.data.performanceData.date,
                  resultData.data.performanceData.place,
                  resultData.data.performanceData.price,
                  resultData.data.performanceData.actors,
                  resultData.data.performanceData.imageUrl,
                )
                .subscribe((performances) => {
                  this.performance.name = resultData.data.performanceData.name;
                  this.performance.description = resultData.data.performanceData.description;
                  this.performance.date = resultData.data.performanceData.date;
                  this.performance.place = resultData.data.performanceData.place;
                  this.performance.price = resultData.data.performanceData.price;
                  this.performance.actors = resultData.data.performanceData.actors;
                  this.performance.imageUrl = resultData.data.performanceData.imageUrl;
                  loadingEl.dismiss();
                });
            });
        }
      });
  }

  failedAlert(message: string) {
    this.alertCtrl.create({
    message,
    buttons: [{
    text: 'OK',
      handler: () => {
        this.onReserve();
      }
    }]

    }).then(alertEl => {
      alertEl.present();
    });
  }

  onReserve(){
    this.date = new Date(this.performance.date);
    console.log('date:' + this.date);
    console.log('current date: ' + this.currentDate);
    if(this.date < this.currentDate){
      this.toastMessage(`Nije moguće rezervisati karte. Predstava ${this.performance.name} je već odigrana.`);
    }else{
      this.alertCtrl.create({header: 'Rezervacija',
      message: 'Koliko karata želite da rezervišete?',
      inputs: [
        {
          name: 'numberOfTickets',
          type: 'number',
          placeholder: 'Broj karata',
        }
      ],
      buttons: [{
        text: 'Odustanite',
        role: 'cancel'
      }, {
        text: 'Rezervišite',
        handler: (alertData) => {
          if(alertData.numberOfTickets === '' || alertData.numberOfTickets <= 0) {
            this.failedAlert('Morate da unesete ispravan broj karata.');
            } else {
              this.userReservationsService.reserveTickets(this.performance, alertData.numberOfTickets).subscribe(() => {
                this.navCtrl.navigateBack('/performances/tabs/reservations');
                this.toastMessage(`Uspešno ste rezervisali karte za predstavu ${this.performance.name}. Možete ih preuzeti najkasnije pola sata do početka predstave!`);
              });
          }
        }
      }]
      }).then(alertEl => {
        alertEl.present();
      });
    }
  }

  async toastMessage(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 5000,
    });
    toast.present();
  }

}

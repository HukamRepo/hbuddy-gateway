import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { SharedService } from './shared.service';

@Injectable()
export class GatewayService {

  private headers: Headers;
  private reqOptions: RequestOptions;

  private refreshHeaders(){
    this.headers = new Headers();
    this.headers.append('Content-Type', 'application/json');
    this.headers.append('Accept', 'application/json');
    this.headers.append("X-IBM-Client-Id", "default");
    this.headers.append("X-IBM-Client-Secret", "SECRET");
  }

  constructor(private http: Http, private sharedService: SharedService) {
      this.refreshHeaders();
   }

   fetchGatewayInfo(queryParams): Promise<any>{
     let POST_URL: string = this.sharedService.CONFIG.API_BASE_URL + "/Subscriptions/weather/alert";
     if(!queryParams || !queryParams.lat || !queryParams.lng){
         return Promise.reject("INVALID DATA");
     }else{
         this.reqOptions = new RequestOptions({headers: this.headers});
         return this.http.post(POST_URL, queryParams, this.reqOptions)
         .toPromise()
         .then(this.extractData)
               .catch(this.handleErrorPromise);
     }
   }

   private extractData(res: Response) {
         let body = res.json();
         return body;
   }

   private handleErrorPromise (error: Response | any) {
 	     console.error(error.message || error);
        return Promise.reject(error.message || error);
   }

}

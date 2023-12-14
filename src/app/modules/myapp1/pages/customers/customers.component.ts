import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersComponent  implements OnInit {
  @Input() data:any={};
  show_addedit_form=false;
  model:any={};
  items:any=[];
  limit=20;
  item:any={};
  if_exist_customer_note='';

  loading=false;
  constructor(public apiService:ApiService) { }

  ngOnInit() {
    this.limit=this.data.limit ?? 20;
    this.getList(true); 

  }
  formSubmit(){

    //validation
    if(this.if_exist_customer_note!=''){
      this.apiService.present_toast('error',this.if_exist_customer_note);
      return;
    }

    if(this.loading){
      return;
    }
    

    
    this.loading=true;
    console.log(this.model);
    this.apiService.save('customers',this.model).subscribe((response)=>{
     // console.log(response);
      this.getList(false);
      this.show_addedit_form=false;
      this.loading=false;
    },(error)=>{
      console.log(error);
      this.loading=false;
    })
  }

  getList(useCache=false){
    this.apiService.get('customers',{fields:'*,customer.id,customer.name,flavour.id,flavour.name,shape.id,shape.name',sort:'-date_created'},useCache).subscribe((response)=>{
      this.items=response.data;
    },(error)=>{
      console.log(error);
    })
  }

  editItem(item){
    this.model=this.apiService.cloneWR(item);
    this.item=this.model; 
    this.if_exist_customer_note='';
    this.show_addedit_form=true;
  }

  checkIfExists(){
      let le=this.items.filter((item)=>{
        return item.mobile==this.model.mobile;
      });
      if(le.length>0){
        this.if_exist_customer_note='Already exists : '+le[0].name +' - Mobile :'+le[0].mobile;
      }else{
        this.if_exist_customer_note='';
      }
  }

}

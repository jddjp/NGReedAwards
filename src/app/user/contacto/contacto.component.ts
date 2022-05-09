import { Component, OnInit ,EventEmitter,Output,Input} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { VariablesService } from 'src/app/services/variablesGL.service';
import { ContactoService } from 'src/app/services/contacto.service';


@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class ContactoComponent implements OnInit {

  @Output() fetchNominaciones: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Input() accion: string;
  contactoForm: FormGroup;
  submitted: boolean;

  contactomodel = {
    name: '',
    correo: '',
    mensaje:''
  }

  constructor(
    private contactoService: ContactoService,
    private toastr: ToastrService,

  ) { }

  ngOnInit(): void {
  
  }


  async add() {
    const { name, correo,mensaje } = this.contactomodel;
    await   this.contactoService.addNominacion({
      nombre: name,
      correo: correo,
      mensaje: mensaje,
      uid: JSON.parse(localStorage.d).uid
    });
    this.toastr.success('Alguien Se pondra en contacto!', 'Success');
  }




  }




import { Injectable } from '@angular/core';


export interface QlikField {
  selectValues: (option: Array< | number>, toggle: boolean, softLock?: boolean) => Promise<boolean>;
  selectAll: () => Promise<boolean>;
  selectExculed: () => Promise<boolean>;
  clear: () => Promise<boolean>;
}

export interface FieldOption {
  qText: string;
  qNum?: number;
  qState: string;
  qElemNumber: number;
}


@Injectable({
  providedIn: 'root'
})

export class QlikFieldServiceTsService {

  constructor() { }
}

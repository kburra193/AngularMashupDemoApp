// Importing necessary modules from Angular and Qlik API
import { Injectable, OnDestroy } from '@angular/core'; // Angular's Injectable decorator
import {
  SortCriteria,
  openAppSession,
  type AppSession,
  type Doc,
  type GenericObject,
  type GenericObjectLayout,
} from '@qlik/api/qix'; // Qlik's authentication and QIX Engine API
import { setDefaultHostConfig, type HostConfig } from '@qlik/api/auth'; // Qlik's HostConfig interface
import { BehaviorSubject } from 'rxjs';

// Add an interface for Sheet if the structure is known
interface Sheet {
  id: string;
  title: string;
  description: string;
}

export enum AlternateState {
  DEFAULT = "",
  BDP = "bdp",
}

// The Injectable decorator marks it as a service that can be injected into other parts of the Angular application
@Injectable({
  providedIn: 'root', // This service is provided at the root level, meaning it's a singleton and can be injected anywhere in the app
})
export class QlikService {
  // Define a private property to hold the host configuration for Qlik API
  private hostConfig: HostConfig = {
    authType: 'oauth2', // The type of authentication to use
    host: '', // The host of the Qlik cloud tenant
    clientId: '', // The client ID for OAuth2 authentication
    redirectUri: 'https://localhost:4200/assets/oauth-redirect.html', // The redirect URI after successful authentication
    accessTokenStorage: 'session' // Where to store the access token
  };

  // Define a private property to hold the current Qlik app
  private currentApp: any;
  private openObjects: GenericObject[] = [];
  private currentAppSession: AppSession | null = null;

  // The constructor function is called when an instance of the QlikService is created
  constructor() {
    setDefaultHostConfig(this.hostConfig);
  }

  // Observable source
  private _selectionChangedSource = new BehaviorSubject<boolean>(false);

  // Observable stream
  selectionChanged$ = this._selectionChangedSource.asObservable();

  // Call this method when a selection is made
  notifySelectionChange() {
    this._selectionChangedSource.next(true);
  }

  // // An async function to set the current app using its ID
  // async setCurrentApp(appId: any) {
  //   console.log('Setting current app:', appId, "; current app:", this.currentApp);
  //   // sets a default host config for every api request
  //   // Open a session with the Qlik app and store it in the currentApp property
  //   const appSession = openAppSession({ appId: appId })
  //   this.currentAppSession = appSession;
  //   this.currentApp = await appSession.getDoc();

  //   // // Listen for changes in the Qlik document
  //   // this.currentApp.on('changed', () => {
  //   //   this._selectionChangedSource.next(true);
  //   // });
  // }
  async setCurrentApp(appId: string, identity?: string) {
    console.log(
      'Setting current app:',
      appId,
      '; current app:',
      this.currentApp
    );
    // Set a default host config for every API request
    setDefaultHostConfig(this.hostConfig);
    try {
      // Include the identity in the session configuration if provided
      const sessionConfig = identity
        ? { ...this.hostConfig, identity }
        : this.hostConfig;

      // Open a session with the Qlik app using the sessionConfig
      this.currentAppSession = openAppSession({
        appId: appId,
        ...sessionConfig,
      });
      this.currentApp = await this.currentAppSession.getDoc();
    } catch (error) {
      console.error('Error setting current app:', error);
      throw error;
    }
    // Load the Qlik Embed script dynamically
    const script = document.createElement('script');
    script.src = `https://${this.hostConfig.host}/resources/assets/external/requirejs/require.js`; // Adjust the URL to the correct embed script
    script.async = true;
    script.onload = () => {
      // Script has loaded
      console.log('Qlik Embed script loaded successfull.');

      // Initialize the Qlik Embed with your specific configuration
      this.initializeQlikEmbed(appId);
    };
    document.body.appendChild(script);
  }

  private initializeQlikEmbed(appId: string): void {
    // Here you would initialize the Qlik embed with the app ID and other necessary configurations
    console.log(`Initializing Qlik Embed for app ID: ${appId}`);
  }
  // A function to get data for a specific object in the current Qlik app
  async getDataForObject(objectId: any): Promise<any> {
    // Get the object from the current app using its ID, then get its layout
    const obj = await this.currentApp.getObject(objectId);
    const layout = await obj.getLayout();
    obj.on('changed', (evt: any) => {
      console.log('Object changed:', evt);
      this._selectionChangedSource.next(true);
    }); // Listen for changes in the object
    return layout.qHyperCube.qDataPages[0].qMatrix;
  }

  async createHyperCubeForFieldsOrExpressions(
    fields: string[],
    expressions: string[],
    sortCriteria?: SortCriteria
  ): Promise<any> {

    // Create a hypercube definition object
    const qHyperCubeDef = {
      qDimensions: fields.map((field: any) => {
        return {
          qDef: {
            qFieldDefs: [field],
            qSortCriterias: sortCriteria && field in sortCriteria ? [sortCriteria[field]] : undefined
          },
        };
      }),
      qMeasures: expressions.map((expression: any) => {
        return {
          qDef: {
            qDef: expression,
          },
        };
      }),
      qInitialDataFetch: [
        {
          qTop: 0,
          qLeft: 0,
          qWidth: 10,
          qHeight: 1000,
        },
      ]
    };
    return qHyperCubeDef;
  }

  async getHypercube(qHyperCubeDef: any, alternateState: AlternateState = AlternateState.DEFAULT){
    // Create a session object with the qHyperCubeDef
    const sessionObject = await this.currentApp.createSessionObject({
      qInfo: {
        qType: 'my-hypercube',
      },
      qStateName: alternateState,
      qHyperCubeDef: qHyperCubeDef,
    });
    this.openObjects.push(sessionObject); // Update the type of openObjects array
    // Get the layout of the session object
    const layout = await sessionObject.getLayout();
    sessionObject.on('changed', (evt: any) => {
      console.log('Session object changed', evt);
      this._selectionChangedSource.next(true);
    }); // Listen for changes in the session object
    return {layout, sessionObject};
  }

  async getHyperCubeData(qHyperCubeDef: any, numColumns: number = 20, alternateState: AlternateState = AlternateState.DEFAULT): Promise<any> {
    const {layout, sessionObject} = await this.getHypercube(qHyperCubeDef, alternateState);
    //Read data height
    const myListBoxDataHeight = layout.qHyperCube.qSize.qcy; // gets total number of rows in the hypercube
    const dataPage = 100;
    let hypercubeData: any[] = [];
    //Loop over data height and reading data from hypercube - fetches the data in chunks of 100 rows at a time
    for (let dataStep = 0; dataStep < myListBoxDataHeight; dataStep=dataStep+dataPage) {
      let getDataDef = {
        "qPath": "/qHyperCubeDef",
        "qPages": [
          {
            "qLeft": 0,
            "qTop": dataStep,
            "qWidth": numColumns,
            "qHeight": dataPage
          }
        ]
      }
      //Method for reading data from hypercube
      const currentHypercubeData = await sessionObject.getHyperCubeData(getDataDef);
      //Concatenate hypercube data
      hypercubeData = hypercubeData.length > 0 ? [... hypercubeData, ... currentHypercubeData [0].qMatrix] : [...currentHypercubeData [0].qMatrix];
    }
    return hypercubeData;
  }

  // Function to evaluate a Qlik expression
  async evaluateExpression(expression: string): Promise<any> {
    if (!this.currentApp) {
      console.error('No current app set in QlikService');
      return null;
    }

    try {
      // Use the appropriate API call to evaluate the expression.
      // This is an example based on the generic object method.
      let result = await this.currentApp.evaluate({
        qExpression: expression,
      });

      return isNaN(result) ? result : Number(result);
    } catch (error) {
      console.error('Error evaluating expression:', error);
      throw error; // Or handle the error as appropriate for your application
    }
  }

  async getGenericListData(field: string): Promise<any> {
    const genericList = await this.currentApp.createSessionObject({
      qInfo: {
        qType: 'ListObject',
      },
      qListObjectDef: {
        qDef: {
          qFieldDefs: [field],
        },
        qShowAlternatives: true,
        qInitialDataFetch: [
          {
            qTop: 0,
            qLeft: 0,
            qWidth: 1,
            qHeight: 10000,
          },
        ],
      },
    });
    const layout = await genericList.getLayout();
    return layout.qListObject.qDataPages[0].qMatrix;
  }

  async selectFieldValue(fieldName: string, value: string) {
    try {
      // Await the promise returned by getField and store the result in qlikField
      const qlikField = await this.currentApp.getField(fieldName);
      // Use the selectValues method on the obtained field to select the specified value
      await qlikField.selectValues([{ qText: value }], false, false);
    } catch (error) {
      console.error('Error selecting field value:', error);
    }
  }

  async selectMultipleValuesPerField(fieldName: string, values: any[], alternateState: AlternateState = AlternateState.DEFAULT) {
    try {
      // Await the promise returned by getField and store the result in qlikField
      const qlikField = await this.currentApp.getField(fieldName, alternateState);
      // Use the selectValues method on the obtained field to select the specified value
      await qlikField.selectValues(values, false, false);
    } catch (error) {
      console.error('Error selecting field value:', error);
    }
  }

  //clear all selections
  async clearAllFieldValues(){
    await this.currentApp.clearAll();
  }

  async getBookmarksList(){
    return await this.currentApp.getBookmarks({
      "qOptions": {
        "qTypes": [
          "Bookmark"
        ],
        "qData": {},
        "qIncludePatches": false
      }
    });
  }

  async createBookmark(bookmarkId: string){
    await this.currentApp.createBookmark({
      "qProp": {
        "qInfo": {
          "qId": bookmarkId,
          "qType": "Bookmark"
        },
        "qMetaDef": {},
        "qIncludeVariables": true,
        "qDistinctValues": true
      }
    });
  }

  async applyBookmark(bookmarkId){
    //apply selected bookmark
    await this.currentApp.applyBookmark(bookmarkId);
  }

  async deleteBookmark(bookmarkId){
    //delete selected bookmark
    await this.currentApp.destroyBookmark(bookmarkId);
  }

  //clear by field
  public async clearSelectionsByField(fieldName:string): Promise<any> {
    const app = await this.currentApp.getField(fieldName);
    return await app.clear()
  }

  // Method to get the sheets for the current Qlik app
  async getSheets(): Promise<Sheet[]> {
    try {
      // Make sure there is a current app
      if (!this.currentApp) {
        throw new Error('No current app set in QlikService');
      }

      // Call the Qlik API to get sheets information
      const sheetsList = await this.currentApp.getSheetList();

      // Explicitly define the return type of the map function
      return sheetsList.map(
        (item: any): Sheet => ({
          id: item.qInfo.qId,
          title: item.qMeta.title,
          description: item.qMeta.description,
        })
      );
    } catch (error) {
      console.error('Error getting sheets:', error);
      throw error; // Or handle the error as appropriate for your application
    }
  }
  async getVisualizations(sheetId: string): Promise<any[]> {
    try {
      // Fetch the sheet object
      const sheet = await this.currentApp.getObject(sheetId);

      const sheetLayout = await sheet.getLayout();
      // Get the properties of the sheet, which includes its children objects
      const sheetProps = await sheet.getProperties();

      // The children objects are usually stored in the `cells` array of the sheet properties
      const cells = sheetProps.cells || [];

      debugger;
      const visualizationsPromises = cells
        // Filter out cells with type "action-button"
        .filter(
          (cell: any) => !['action-button', 'filterpane'].includes(cell.type)
        )
        .map(async (cell: any) => {
          try {
            // For each cell, get the corresponding object (visualization)
            const viz = await this.currentApp.getObject(cell.name);
            const vizProps = await viz.getProperties();

            console.log('Visualization properties:', vizProps);
            // Return the necessary metadata for the visualization
            return {
              id: vizProps.qInfo.qId,
              title: vizProps.qMetaDef.title,
              type: vizProps.qInfo.qType,
              col: cell.col,
              colspan: cell.colspan,
              row: cell.row,
              rowspan: cell.rowspan,
            };
          } catch (error) {
            console.error(
              `Error getting visualization properties for ${cell.name}:`,
              error
            );
            return null;
          }
        });

      // Resolve all promises and filter out any failed attempts
      const visualizations = (await Promise.all(visualizationsPromises)).filter(
        (viz) => viz !== null
      );

      console.log('Visualizations:', visualizations);
      return visualizations;
    } catch (error) {
      console.error('Error getting visualizations metadata:', error);
      throw error;
    }
  }

  async closeAllObjects() {
    await Promise.all(
      this.openObjects.map(async (obj) => {
        await this.currentApp.destroySessionObject(obj.id);
      })
    );
  }

  ngOnDestroy(): void {
    if (!this.currentAppSession || !this.currentApp) {
      return;
    }
    // Close any open sessions or perform other cleanup
    this.closeAllObjects();
    this.currentAppSession.close();
    this._selectionChangedSource.complete();
  }

  //clearall created KB
  public async clearAllSelections(fieldName:string): Promise<any> {
    const app = await this.currentApp.getField(fieldName);
    return await app.clearAll()
  }
}

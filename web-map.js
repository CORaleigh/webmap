require([
    "esri/views/MapView",
    "esri/WebMap"
  ], function (MapView, WebMap) {
  
    class ArcGISWebMapElement extends HTMLElement {
      /**
       * We want to observe changes an attribute, which
       * is a reference to our webmap.
       */
      static get observedAttributes () {
        return ['webmapid', 'querylayer', 'querywhere', 'legend', 'layerlist', 'basemapselect', 'basemapgroup'];
      }
  
      /**
       * The elements constructor function, you must call `super()`
       * here and you can also do other one time setup here.
       */
      constructor () {
        super();
  
        // setup a container for our map view
        this.container = document.createElement('div');
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.style.display = 'block';
  
        // setup at the MapView to point to our container
        this.view = new MapView({
          container: this.container
        });
      }
  
      /**
       * Called when this elemetn is added to the DOM. This is called
       * every time the element is added so you should cleanup in the
       * disconnectedCallback lifecycle function.
       */
      connectedCallback () {
        this.appendChild(this.container);
        this.setupMap();
      }
  
      /**
       * Called when the element is removed from the DOM. This mostly is for
       * cleaning up after ourselves.
       */
      disconnectedCallback () {
        this.removeChild(this.container);
        this.view.destroy();
      }
  
      /**
       * Called when one of our observedAttributes changes. Careful this is also
       * called the first time many attributes are set. Often oldValue might be
       * the inital value of the attribute and newValue might be undefined or null.
       */
      attributeChangedCallback (attribute, oldValue, newValue) {
        if (attribute === 'webmapid') {
          if (newValue || !newValue && oldValue) {
            this.map = new WebMap({
              portalItem: {
                id: this.webmapid
              }
            });
  
            this.setupMap();
          }
        }
        
        if (attribute === 'querywhere') {
            
            require([
                "esri/layers/FeatureLayer"
              ],  (FeatureLayer) => {                
                  this.view.on('layerview-create', (layerView) => {
                      if (layerView.layer.title === this.querylayer) {
                        layerView.layer.queryFeatures({where: this.querywhere, returnGeometry: true, outSpatialReference: this.view.spatialReference, outFields: ['*']}).then(result => {
                          if (result.features.length) {
                            if(this._showPopup) {
                              this.view.popup.open({features: result.features});
                            }
                            this.view.goTo(result.features[0], {duration:2500});
                          }
                        });
                      }
                    });
              });
        }
        if (attribute === 'legend') {
            
            require([
                "esri/widgets/Legend",
                "esri/widgets/Expand"
              ],  (Legend, Expand) => {                
                    const legend = new Legend({
                        view: this.view,
                        style: "classic",
                        container: document.createElement("div"),            
                      })
                      const legendExpand = new Expand({
                
                        view: this.view,
                        group: 'top-right',
                        expandTooltip: 'Legend',
                
                        expandIconClass: "esri-icon-layer-list",
                        //@ts-ignore
                        content: legend.domNode,
                        expanded: false
                        });   
                      this.view.ui.add(legendExpand, 'top-right');
              });      
        }
        if (attribute === 'layerlist') {
            require([
                "esri/widgets/LayerList",
                "esri/widgets/Expand"
              ],  (LayerList, Expand) => {                
                const layerList = new LayerList({
                    view: this.view,
                    container: document.createElement("div"),            
                  })
                  const layerExpand = new Expand({
            
                    view: this.view,
                    group: 'top-right',
                    expandTooltip: 'Layers',
            
                    expandIconClass: "esri-icon-layers",
                    //@ts-ignore
                    content: layerList.domNode,
                    expanded: false
                    });   
                  this.view.ui.add(layerExpand, 'top-right');
              });                
        }
        if (attribute === 'basemapselect') {
            require([
                "esri/widgets/BasemapGallery",
                "esri/widgets/Expand",
                'esri/widgets/BasemapGallery/support/PortalBasemapsSource'                
              ],  (BasemapGallery, Expand, PortalBasemapsSource) => {     
                let baseMapList;
                if (this.basemapgroup) {
                  baseMapList = new BasemapGallery({
                    view: this.view,
                    container: document.createElement("div"),  
                    source: new PortalBasemapsSource({
                      query: "id:" + this._basemapGroupId
                    })     
                  });        
                } else {
                  baseMapList = new BasemapGallery({
                    view: this.view,
                    container: document.createElement("div")   
                  });   
                }
                const baseMapExpand = new Expand({
          
                  view: this.view,
                  group: 'top-right',
                  expandTooltip: 'Basemaps',
          
                  expandIconClass: "esri-icon-basemap",
                  //@ts-ignore
                  content: baseMapList.domNode,
                  expanded: false
                  });   
                this.view.ui.add(baseMapExpand, 'top-right');
              });           
        }                
      }
  
  
      /**
       * This function sets up the map inside our map view.
       */
      setupMap () {
        if (!this.map || !this.view) {
          return;
        }
  
        this.view.map = this.map;
        this.dispatchEvent(new CustomEvent('arcigswebmapsetup',{
          bubbles: true,
          cancelable: true
        }));
      }
  
      /**
       * These getters and setters expose properties to JavaScript that mirror the
       * attributes. This is neccessary since some frameworks bind to these attributes
       * rather then DOM properties and this makes your DOM elements easier to work
       * with in JavaScript.
       */
      get webmapid () {
        return this.getAttribute('webmapid');
      }
  
      set webmapid (value) {
        this.setAttribute('webmapid', value);
      }
      get querylayer () {
        return this.getAttribute('querylayer');
      }
  
      set querylayer (value) {
        this.setAttribute('querylayer', value);
      }      
      get querywhere () {
        return this.getAttribute('querywhere');
      }
  
      set querywhere (value) {
        this.setAttribute('querywhere', value);
      }
      get layerlist () {
        return this.getAttribute('layerlist');
      }
  
      set layerlist (value) {
        this.setAttribute('layerlist', value);
      }     
      get legend () {
        return this.getAttribute('legend');
      }
  
      set legend (value) {
        this.setAttribute('legend', value);
      }              
      get basemapselect () {
        return this.getAttribute('basemapselect');
      }
  
      set basemapselect (value) {
        this.setAttribute('basemapselect', value);
      }     
      get basemapgroup () {
        return this.getAttribute('basemapgroup');
      }
  
      set basemapgroup (value) {
        this.setAttribute('basemapgroup', value);
      }                             
    }
  
    customElements.define('arcgis-web-map', ArcGISWebMapElement);
  });
require([
    "esri/views/MapView",
    "esri/WebMap",
    "esri/Map"
  ], function (MapView, WebMap, Map) {
  
    class ArcGISWebMapElement extends HTMLElement {

  
      /**
       * The elements constructor function, you must call `super()`
       * here and you can also do other one time setup here.
       */
      constructor () {
        super();
      /**
       * We want to observe changes an attribute, which
       * is a reference to our webmap.
       */
      static get observedAttributes () {
        return ['webmapid', 'search', 'address', 'querylayer', 'querywhere', 'legend', 'layerlist', 'basemapselect', 'basemapgroup', 'basemap', 'center', 'zoom', 'navigate'];
      }          
        this.closebutton = document.createElement('button');
        this.closebutton.classList.add('md-cb');
        this.closebutton.display = 'block';
        document.body.appendChild(this.closebutton); 
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

        if (attribute === 'basemap') {
          if (!this.webmapid) {
            this.map = new Map({
              basemap: this.basemap,
            });
            this.setupMap();

          }
        }
        if (attribute === 'search') {
          require([
            "esri/widgets/Search"             
          ],  (Search) => {     
            const search = new Search({view: this.view,
              container: document.createElement("div")
            });
            this.view.ui.add(  {
                component: search,
                position: "top-left",
                index: 0
              });
            if (this.address && !this.querylayer) {
              this.view.when(view => {
                search.search(this.address);
              });
            }
          });
        }    
        if (attribute === 'zoom') {
          this.view.zoom = this.zoom;
        }
        if (attribute === 'center') {
          this.view.center = this.center.split(',');
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
                        group: 'bottom-left',
                        expandTooltip: 'Legend',
                
                        expandIconClass: "esri-icon-layer-list",
                        //@ts-ignore
                        content: legend.domNode,
                        expanded: false
                        });   
                      this.view.ui.add(legendExpand, 'bottom-left');
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
                    group: 'bottom-left',
                    expandTooltip: 'Layers',
            
                    expandIconClass: "esri-icon-layers",
                    //@ts-ignore
                    content: layerList.domNode,
                    expanded: false
                    });   
                  this.view.ui.add(layerExpand, 'bottom-left');
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
                  group: 'bottom-left',
                  expandTooltip: 'Basemaps',
          
                  expandIconClass: "esri-icon-basemap",
                  //@ts-ignore
                  content: baseMapList.domNode,
                  expanded: false
                  });   
                this.view.ui.add(baseMapExpand, 'bottom-left');
              });           
        }     
        if (attribute === 'navigate') {
         if (this.navigate === 'false') {
            this.view.on("drag", function(event){
              // prevents panning with the mouse drag event
              event.stopPropagation();
            });
            this.view.on("key-down", function(event){
              // prevents panning with the arrow keys
              var keyPressed = event.key;
              if(keyPressed.slice(0,5) === "Arrow"){
                event.stopPropagation();
              }
              var prohibitedKeys = [ "+", "-", "Shift", "_", "=" ];
              var keyPressed = event.key;
              if(prohibitedKeys.indexOf(keyPressed) !== -1){
                event.stopPropagation();
              }                
            });  
            this.view.on("mouse-wheel", function(event){
              event.stopPropagation();
            });  
            this.view.on("double-click", function(event){
              event.stopPropagation();
            });  
            this.view.on("double-click", ["Control"], function(event){
              event.stopPropagation();
            });      
            this.view.on("drag", ["Shift"], function(event){
              event.stopPropagation();
            });

            this.view.on("drag", ["Shift", "Control"], function(event){
              event.stopPropagation();
            });             
         }
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
        this.view.ui.move([ "zoom"], "bottom-right");

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
      get search () {
        return this.getAttribute('search');
      }
  
      set search (value) {
        this.setAttribute('search', value);
      }               
      get address () {
        return this.getAttribute('address');
      }
  
      set address (value) {
        this.setAttribute('address', value);
      }       
      get basemap () {
        return this.getAttribute('basemap');
      }
  
      set basemap (value) {
        this.setAttribute('basemap', value);
      }     
      get center () {
        return this.getAttribute('center');
      }
  
      set center (value) {
        this.setAttribute('center', value);
      }  
      get zoom () {
        return this.getAttribute('zoom');
      }
  
      set zoom (value) {
        this.setAttribute('zoom', value);
      }   
      get navigate () {
        return this.getAttribute('navigate');
      }
  
      set navigate (value) {
        this.setAttribute('navigate', value);
      }               
    }
  
    customElements.define('arcgis-web-map', ArcGISWebMapElement);
  });

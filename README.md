# webmap
Web component maps for embedding into new Drupal website

# Credit
Code from patrickarlt presentation from 2017 Esri Developer Summit

- webmapid

    - Not required, but very recomended 
    - Determines the map type
    - Allows for the GIS team to focus on the mapping
- search (true/false only)
    - Toggles the visibility of the search bar
- address
    - **Requires search to be set to `true`**
    - Selects the address that is centered upon map load
- querylayer
    - Name of the layer that you want to search (query) on
    - For advanced users only
    - **Requires webmapid**
- querywhere
    - Query field for finding locations
    - SQL search syntax required
    - For advanced users only
        - User must know the field name
        - User must know the fields to query
- legend (true/false only)
    - Toggles the viewing of the legend field
- layerlist (true/false only)
    - Toggles the display of the layer list (shows the list of the layers for users to toggle)
- basemapselect (true/false only)
    - Toggles the display of the basemap type (such as year of sat imagery
- basemapgroup (?)
    - Functionality not fully built out
    - 
- basemap
    - Select from the ESRI default basemaps
    - https://developers.arcgis.com/javascript/latest/api-reference/esri-Map.html
- center (lat,lon)
    - Manual entry of where the map should be centered
    - Will be overidden by `querywhere` and `address` fields
- zoom (# 0-20)
    - Zoom factor of the page
- navigate (true/false)
    - Enable/Disable the ability to pan/zoom on the map

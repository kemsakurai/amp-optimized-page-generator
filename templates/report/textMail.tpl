################### amp-optimized-page-generator ({{{ date }}}) ####################
        Type of Output/Format: stdout / text
        report for Host: {{ hostname }}
################################################################################

|url|ampUrl|lastmod|status|
{{#tasks}}
|{{{ url }}}|{{{ ampUrl }}}|{{ lastmod }}|{{ status }}|
{{/tasks}}
{{^tasks}}
No records :(
{{/tasks}}

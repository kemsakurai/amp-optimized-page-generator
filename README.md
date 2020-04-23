# amp-optimized-page-generator       

[ブログ | Monotalk](https://www.monotalk.xyz/) の AMPページのHTML を取得して、    
[amp-toolbox/packages/optimizer at master · ampproject/amp-toolbox](https://github.com/ampproject/amp-toolbox/tree/master/packages/optimizer) で変換した HTML を保存するツールです。     


-----------------------------------------------------
## Usage            

ツールの使用方法を記載します。     

------------
### ツールの説明       

* **ampUrlFinder.js**        
sitemap.xml に定義されたページにアクセスし、`"link[rel='amphtml']` で定義されているAMP のURLを収集します。    
収集結果は、`urlAmpUrlRelations.json` として出力します。    

* **htmlGenerator.js**      
`urlAmpUrlRelations.json`をINPUTにして、`htmls`フォルダに、最適化した AMP HTMLを出力します。   

### インストール
```console
git clone https://github.com/kemsakurai/amp-optimized-page-generator.git
```

```console
cd amp-optimized-page-generator/
```

```console
npm install
```

```console
mkdir htmls
```

### 実行    

```console
npm run find-amp-url
```

```console
npm run gen-html
```

------------
### 設定      

`config.js` を変更すると、参照するサイトマップとdomainUrlを変更できます。      
`domainUrl` は、linkタグから取得したAMP URL の接頭部に付与する文字列です。       

* **config.js**   
```javascript
module.exports = {
    siteMapUrl : 'https://www.monotalk.xyz/sitemap.xml',
    domainUrl : 'https://www.monotalk.xyz'
};
```

------------
### Django プロジェクト配下にテンプレートとして配置する    
templatesディレクトリ配下に、htmlsフォルダを配置して、urls.py でマッピングします。     
```console
#!/bin/sh
PROJECT_HOME="<django_project_home>"
rm -Rf "$PROJECT_HOME"amp_start_blog_post/templates/amp_start_blog_post/htmls
\cp -Rf htmls "$PROJECT_HOME"amp_start_blog_post/templates/amp_start_blog_post/htmls
````


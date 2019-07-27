# amp-optimized-page-generator       

[ブログ | Monotalk](https://www.monotalk.xyz/) の AMPページのHTML を取得して、    
[amp-toolbox/packages/optimizer at master · ampproject/amp-toolbox](https://github.com/ampproject/amp-toolbox/tree/master/packages/optimizer) で変換した HTML を保存するツールです。     


-----------------------------------------------------
## Usage            

### ツールの説明       

* **ampUrlFinder.js**        


### インストール、実行    
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

```console
npm run find-amp-url
```

```console
npm run gen-html
```

### Django プロジェクト配下にテンプレートとして配置する    
```console
#!/bin/sh
PROJECT_HOME="<django_project_home>"
rm -Rf "$PROJECT_HOME"amp_start_blog_post/templates/amp_start_blog_post/htmls
\cp -Rf htmls "$PROJECT_HOME"amp_start_blog_post/templates/amp_start_blog_post/htmls
````

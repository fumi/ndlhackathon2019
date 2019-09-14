//API呼び出しとユーティリティ

// メタデータ一つを取得するAPI
/*function getItem(id) {
  return axios
    .get("https://jpsearch.go.jp/api/item/" + id)
    .then(function(response) {
      return response.data;
    });
}*/

//function getCoordinate(keyword) {
  //return axios
  //  .get("https://www.geocoding.jp/api/?q=" + keyword)
    /*.then(function(response)){
      let data = response.data;
      data.lat = data.getElementsByTagName('lat');
      data.long = data.getElementsByTagName('long');
      return data;
    };*/
//}

//function currentCoordinate() {
  /*navigator.geolocation.getCurrentPosition(function(position) {
    const lat = position.coords.latitude;
    const long = position.coords.longitude;
    console.log(lat, long);
  });*/
//}

// キーワードでメタデータを検索するAPI
async function searchItems(keyword, from, size) {
  console.log("searchItems");
  const coordinate = await getCoordinate(keyword);
  console.log(coordinate);
  const lat = coordinate.data.getElementsByTagName('lat');
  const long = coorindate.data.getElementsByTagName('long');
  console.log(lat, long);
  //return searchItemsByCoordinate(lat, long);
}

function searchItems2(keyword, from, size) {
  return axios
    .get("https://jpsearch.go.jp/rdf/sparql?default-graph-uri=&query=SELECT+%3Fs+%3Flabel+%3Flat+%3Flong+%3Ftype+WHERE+%7B%0D%0A++++%3Fs+jps%3Aspatial%2Fschema%3Ageo+%5B%0D%0A++++++++schema%3Alatitude+%3Flat%3B%0D%0A++++++++schema%3Alongitude+%3Flong%0D%0A++++%5D+.%0D%0A++++FILTER%28%3Flat+%3C+90%29%0D%0A++++FILTER%28bif%3Ast_within%28%0D%0A++++++++bif%3Ast_point%28%3Flong%2C+%3Flat%29%2C+++%0D%0A++++++++bif%3Ast_point%28139.907700%2C+35.729130%29%2C++3%29%29%0D%0A++++%3Fs+a+%3Ftype+%3B%0D%0A++++++rdfs%3Alabel+%3Flabel+.%0D%0A%7D&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+"
    )
    .then(function(response) {
      return response.data;
    });
}

function getCurrentPosition(options){
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}

function getItemsByPosition(latitude, longitude) {
  const url = "https://jpsearch.go.jp/rdf/sparql?default-graph-uri=&query=SELECT+%3Fs+%3Flabel+%3Flat+%3Flong+WHERE+%7B%0D%0A++++%3Fs+jps%3Aspatial%2Fschema%3Ageo+%5B%0D%0A++++++++schema%3Alatitude+%3Flat%3B%0D%0A++++++++schema%3Alongitude+%3Flong%0D%0A++++%5D+.%0D%0A++++FILTER%28%3Flat+%3C+90%29%0D%0A++++FILTER%28bif%3Ast_within%28%0D%0A++++++++bif%3Ast_point%28%3Flong%2C+%3Flat%29%2C++%0D%0A++++++++bif%3Ast_point%28" +
    longitude +
    "%2C+" +
    latitude +
    "%29%2C+%0D%0A++++++++1+%0D%0A++++%29%29%0D%0A++++%3Fs+a+%3Ftype+%3B%0D%0A++++++++rdfs%3Alabel+%3Flabel++.%0D%0A%7D&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+";
  console.log(url);
  return axios
    .get(url)
    .then(function(response) {
      return response.data;
    })
}

async function searchItemsByCurrentPosition(keyword, size){
  try {
    let position = await getCurrentPosition();
    console.log(position.coords.latitude, position.coords.longitude);
    return getItemsByPosition(position.coords.latitude, position.coords.longitude);
  }
  catch(error){
    console.log(error);
  }
}


// データベースを取得するAPI
function getDatabase(id) {
  return axios
    .get("https://jpsearch.go.jp/api/database/" + id)
    .then(function(response) {
      return response.data;
    });
}

// データベースのラベル定義を取得するAPI
function getLabel(id) {
  return axios
    .get("https://jpsearch.go.jp/api/database/" + id + "/label")
    .then(function(response) {
      return response.data;
    });
}

//組織を取得するAPI
function getOrg(id) {
  return axios
    .get("https://jpsearch.go.jp/api/organization/" + id)
    .then(function(response) {
      return response.data;
    });
}

//コード値を取得するAPI
function getCode(id) {
  return axios
    .get("https://jpsearch.go.jp/api/code/" + id)
    .then(function(response) {
      var data = response.data;
      // 返ってくるのはコード値の配列なので、便利に使えるようにmapを付与
      data.map = {};
      data.values.forEach(function(value) {
        data.map[value.code] = value;
      });
      return data;
    });
}

//ラベル定義から値を取得してくるための関数
function deepFind(obj, path) {
  let values = [];
  _deepFind(path.split("."), obj, values);
  return values;
}

function _deepFind(paths, obj, values) {
  if (obj == null) return;
  var sub = obj[paths[0]];
  if (sub) {
    if (paths.length == 1) {
      if (Array.isArray(sub)) {
        sub.forEach(v => {
          values.push(v);
        });
      } else {
        values.push(sub);
      }
    } else {
      if (Array.isArray(sub)) {
        sub.forEach(node =>
          _deepFind(paths.slice(1, paths.length), node, values)
        );
      } else {
        _deepFind(paths.slice(1, paths.length), sub, values);
      }
    }
  }
}

// CloudFront Function (viewer-request).
//  1. Redirect www.<domain> -> apex (301), preserving path + query.
//  2. Rewrite directory-style URIs to the static-export object key:
//       /            -> /index.html
//       /projects/   -> /projects/index.html
//       /projects    -> /projects/index.html
//     Requests that already target a file (have an extension) pass through.
function handler(event) {
  var request = event.request;
  var host = request.headers.host ? request.headers.host.value : "";

  // www -> apex redirect
  if (host.indexOf("www.") === 0) {
    var apex = host.slice(4);
    var qs = "";
    if (request.querystring) {
      var parts = [];
      for (var k in request.querystring) {
        parts.push(k + "=" + request.querystring[k].value);
      }
      if (parts.length) {
        qs = "?" + parts.join("&");
      }
    }
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: {
        location: { value: "https://" + apex + request.uri + qs },
      },
    };
  }

  // Directory-index rewrite
  var uri = request.uri;
  if (uri.endsWith("/")) {
    request.uri = uri + "index.html";
  } else if (uri.lastIndexOf(".") < uri.lastIndexOf("/")) {
    // No file extension in the last path segment -> treat as a directory.
    request.uri = uri + "/index.html";
  }

  return request;
}

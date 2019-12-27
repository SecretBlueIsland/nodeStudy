var Round = (function () {
    function Round(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }
    return Round;
}());
var Mat = (function () {
    function Mat(a) {
        this.a = a;
        this.m = a.length;
        this.n = a[0].length;
    }
    Mat.prototype.identical = function (y) {
        var m = this.m;
        var n = this.n;
        if (m != y.m || n != y.n) {
            return false;
        }
        var a = this.a;
        for (var i = 0; i < m; i++) {
            for (var j = 0; j < n; j++) {
                if (a[i][j] - y.a[i][j] > 1 / 1000) {
                    return false;
                }
            }
        }
        return true;
    };
    Mat.prototype.transpose = function () {
        var a = this.a;
        var m = this.m;
        var n = this.n;
        var l = new Array(n);
        for (var i = 0; i < n; i++) {
            l[i] = new Array(m);
            for (var j = 0; j < m; j++) {
                l[i][j] = a[j][i];
            }
        }
        return new Mat(l);
    };
    Mat.prototype.sub = function (y) {
        var a = this.a;
        var m = this.m;
        var n = this.n;
        var l = new Array(m);
        for (var i = 0; i < m; i++) {
            l[i] = new Array(n);
            for (var j = 0; j < n; j++) {
                l[i][j] = a[i][j] - y.a[i][j];
            }
        }
        return new Mat(l);
    };
    Mat.prototype.multiply = function (y) {
        var mA = this.m;
        var nA = this.n;
        var mB = y.m;
        var nB = y.n;
        if (nA != mB) {
            return "参数有误";
        }
        var a = this.a;
        var l = new Array(mA);
        for (var i = 0; i < mA; i++) {
            l[i] = new Array(nB);
            for (var j = 0; j < nB; j++) {
                l[i][j] = 0;
                for (var k = 0; k < mB; k++) {
                    l[i][j] += a[i][k] * y.a[k][j];
                }
            }
        }
        return new Mat(l);
    };
    Mat.prototype.inverse = function () {
        if (this.m != 2 || this.n != 2) {
            return "仅用于二维矩阵";
        }
        var a = this.a;
        var r = a[0][0] * a[1][1] - a[1][0] * a[0][1];
        if (!r) {
            return "矩阵不可逆";
        }
        return new Mat([[a[1][1] / r, -a[0][1] / r],
            [-a[1][0] / r, a[0][0] / r]]);
    };
    return Mat;
}());

function caculaBySate(bases, distances) {
    var n = bases.length;
    if (n < 3 || n > 5) {
        return "基站数量错误";
    }
    if (n != distances.length) {
        return "参数不匹配";
    }
    var s = new Array(n);
    for (var i = 0; i < n; i++) {
        var x = bases[i][0];
        var y = bases[i][1];
        var r = distances[i];
        s[i] = new Round(x, y, r);
    }
    var mA = new Array(n - 1);
    for (var i = 0; i < n - 1; i++) {
        mA[i] = [2 * (s[i].x - s[n - 1].x), 2 * (s[i].y - s[n - 1].y)];
    }
    var matA = new Mat(mA);
    var vectorB = new Array(n - 1);
    for (var i = 0; i < n - 1; i++) {
        vectorB[i] = new Array(1);
        vectorB[i][0] = Math.pow(s[i].x, 2) - Math.pow(s[n - 1].x, 2) +
            Math.pow(s[i].y, 2) - Math.pow(s[n - 1].y, 2) +
            Math.pow(s[n - 1].r, 2) - Math.pow(s[i].r, 2);
    }
    var matAT = matA.transpose();
    var ax = matAT.multiply(matA);
    if (typeof ax == "string") {
        return ax;
    }
    var axInv = ax.inverse();
    if (typeof axInv == "string") {
        return axInv;
    }
    var resultA = axInv.multiply(matAT);
    if (typeof resultA == "string") {
        return resultA;
    }
    var res = resultA.multiply(new Mat(vectorB));
    if (typeof res == "string") {
        return res;
    }
    for (var i = 0; i < 20; i++) {
        var x = res.a[0][0];
        var y = res.a[1][0];
        var g = [[0], [0]];
        var jTj = [[0, 0], [0, 0]];
        for (var i_1 = 0; i_1 < n; i_1++) {
            var dX = x - s[i_1].x;
            var dY = y - s[i_1].y;
            var d = Math.sqrt(Math.pow(dX, 2) + Math.pow(dY, 2));
            var f = d - s[i_1].r;
            g[0][0] += dX * f / d;
            g[1][0] += dY * f / d;
            jTj[0][0] += Math.pow(dX, 2) / Math.pow(d, 2);
            jTj[0][1] += dX * dY / Math.pow(d, 2);
        }
        jTj[1][0] = jTj[0][1];
        jTj[1][1] = n - jTj[0][0];
        var jv = new Mat(jTj).inverse();
        if (typeof jv == "string") {
            return jv;
        }
        var b = jv.multiply(new Mat(g));
        if (typeof b == "string") {
            return b;
        }
		console.log([res.a[0][0], res.a[1][0]].map(v=>v.toFixed(3)))
        var residual = 1 / 50;
        if ([b.a[0][0], b.a[1][0]].every(v=>Math.abs(v)<residual)) {
            return "精度达到要求"
        }
        else {
            res = res.sub(b);
        }
    }
    return "发散"
}

var beacons = [[20.0, 22.5], [18.0, 20.0], [20.0, 22.0], [100.0, 100.0], [19.0, 19.5]]
const factor = 2.8

let dataArray = [[0,-85],[1,-44],[4,-59],[2,-72]],
	calBasesArray = [],
	distances = []
for (let i = 0; i < 4; i ++) {
	let index = dataArray[i][0],
		rssi = dataArray[i][1],
		distance = Number((Math.pow(10, (- 60 - rssi) / (10 * factor))).toFixed(2))
	calBasesArray.push(beacons[index])
	distances.push(distance)
}
console.log(caculaBySate(calBasesArray, distances))
---
oj: dmy
pid: '274'
title: '[R44F] 事事顺'
difficulty: 提高+/省选-
tags:
  - 数论
  - 质因数分解
  - 莫队
  - 离线
timeLimit: 1.5s
memoryLimit: 512m
---

> 数据规模：$1 \le n, q \le 10^5$，$1 \le a_i \le n$。

## 思路

先刻画「顺」数。把每个数写成「平方部分 × 平方自由核」：记 $g(x)$ 为 $x$ 中出现**奇数次幂**的质因子的乘积（平方自由核）。例如 $44 = 2^2 \times 11$ 的核是 $11$，$8 = 2^3$ 的核是 $2$，$12 = 2^2 \times 3$ 的核是 $3$，$1$ 的核是 $1$。则

$$x \text{ 是顺的} \iff g(x) \text{ 是质数}$$

即平方自由核恰好是一个质数。

对乘积同样成立：$a_i \cdot a_j$ 的平方自由核等于 $g(a_i)$ 与 $g(a_j)$ 的核相乘后再去掉偶次幂，等价于两个质因子集合做对称差。因此

$$a_i a_j \text{ 是顺的} \iff g(a_i) \text{ 与 } g(a_j) \text{ 的质因子集合恰好相差一个元素}$$

也就是其中一个核是另一个核乘以一个质数（整除且商为质数）。

于是问题变成：对每个区间 $[l, r]$，统计有多少对 $(i, j)$ 满足两个元素的核互为「覆盖关系」（集合相差一个质因子）。这是典型的**莫队**可维护的计数：维护窗口内每个核值的出现次数 $c[g]$，以及 $up[g]$ = 窗口内核值为 $g$ 的「上层邻居」（即 $g \cdot p$、$p$ 为质数且该核值出现过）的元素个数。

加入一个核值为 $g$ 的元素 $x$ 时，与它组成好对的现存元素恰好是：

- 核值为 $g/p$（$p \mid g$）的元素：$\sum_{p \mid g} c[g/p]$，只需枚举 $g$ 的质因子（最多 6 个）；
- 核值为 $g \cdot p$ 的元素：直接取 $up[g]$。

于是 $x$ 新增的好对数 $= up[g] + \sum_{p \mid g} c[g/p]$，随后 $c[g] \mathrel{+}= 1$，并让 $x$ 成为每个 $g/p$ 的上层邻居（$up[g/p] \mathrel{+}= 1$）。删除为对称的逆操作。这样每次指针移动的代价是 $O(\omega(g))$，其中 $\omega(g) \le 6$（$10^5$ 以内的数最多有 $2 \times 3 \times 5 \times 7 \times 11 \times 13 = 30030$ 个不同质因子，再多就超过 $10^5$）。

查询按**希尔伯特序**排序，能把莫队指针总移动量控制在 $O(n \sqrt q)$ 且常数更小。

预处理用线性筛求出每个数的最小质因子，再对每个 $a_i$ 分解出平方自由核 $g_i$ 与它的质因子列表（$g_i / p$）。

## 复杂度

时间 $O(n \sqrt q \cdot \omega + n \log \log \max a)$，空间 $O(n + \max a)$，其中 $\omega \le 6$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.sort.*
import std.collection.*

let ROTATE_DELTA: Array<Int64> = [3, 0, 0, 1]

// 希尔伯特序：把 (x, y) 映射到 0..4^pow 之间的整数，用于莫队排序降低指针移动次数
func hilbertOrder(x: Int64, y: Int64, pow: Int64, rotate: Int64): Int64 {
    if (pow == 0) {
        return 0
    }
    let hpow = Int64(1) << (pow - 1)
    var seg: Int64 = 0
    if (x < hpow) {
        if (y < hpow) {
            seg = 0
        } else {
            seg = 3
        }
    } else {
        if (y < hpow) {
            seg = 1
        } else {
            seg = 2
        }
    }
    seg = (seg + rotate) & 3
    let nx = x & (hpow - 1)
    let ny = y & (hpow - 1)
    let nrot = (rotate + ROTATE_DELTA[seg]) & 3
    let subSquareSize = Int64(1) << (2 * pow - 2)
    let ans = seg * subSquareSize
    let add = hilbertOrder(nx, ny, pow - 1, nrot)
    return ans + add
}

// 把下标 i 的元素加入窗口：新形成的「好对」= 与它掩码恰好差一个质因子的现存元素数
func addElem(i: Int64, gv: Array<Int64>, subs: Array<Array<Int64>>, c: Array<Int64>, up2: Array<Int64>, curAns: Int64): Int64 {
    let g = gv[i]
    var ans = curAns + up2[g]
    let ss = subs[i]
    for (k in ss) {
        ans += c[k]
    }
    for (k in ss) {
        up2[k] += 1
    }
    c[g] += 1
    return ans
}

// 从窗口移除下标 i 的元素（addElem 的逆操作）
func removeElem(i: Int64, gv: Array<Int64>, subs: Array<Array<Int64>>, c: Array<Int64>, up2: Array<Int64>, curAns: Int64): Int64 {
    let g = gv[i]
    var ans = curAns - up2[g]
    let ss = subs[i]
    for (k in ss) {
        ans -= c[k]
    }
    c[g] -= 1
    for (k in ss) {
        up2[k] -= 1
    }
    return ans
}

main(): Int64 {
    let reader = getStdIn()
    let nq = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nq[0]
    let q = nq[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    var maxA: Int64 = 0
    var i: Int64 = 0
    while (i < n) {
        if (a[i] > maxA) {
            maxA = a[i]
        }
        i += 1
    }

    // 线性筛最小质因子
    let spf = Array<Int64>(maxA + 1, { _ => 0 })
    var pi: Int64 = 2
    while (pi <= maxA) {
        if (spf[pi] == 0) {
            var j = pi
            while (j <= maxA) {
                if (spf[j] == 0) {
                    spf[j] = pi
                }
                j += pi
            }
        }
        pi += 1
    }

    // gv[i] = a_i 的平方自由核（出现奇数次幂的质因子之积）；subs[i] = gv[i] 去掉一个质因子后的各值
    let gv = Array<Int64>(n, { _ => 0 })
    let subs = Array<Array<Int64>>(n, { _ => Array<Int64>(0, { _ => 0 }) })
    i = 0
    while (i < n) {
        var x = a[i]
        var g: Int64 = 1
        while (x > 1) {
            let p = spf[x]
            var cnt: Int64 = 0
            while (x % p == 0) {
                x = x / p
                cnt += 1
            }
            if (cnt % 2 == 1) {
                g = g * p
            }
        }
        gv[i] = g
        var y = g
        let arr = ArrayList<Int64>()
        while (y > 1) {
            let p = spf[y]
            arr.add(g / p)
            while (y % p == 0) {
                y = y / p
            }
        }
        subs[i] = arr.toArray()
        i += 1
    }

    let ql = Array<Int64>(q, { _ => 0 })
    let qr = Array<Int64>(q, { _ => 0 })
    i = 0
    while (i < q) {
        let lr = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        ql[i] = lr[0] - 1
        qr[i] = lr[1] - 1
        i += 1
    }

    let keys = Array<Int64>(q, { _ => 0 })
    let order = Array<Int64>(q, { _ => 0 })
    i = 0
    while (i < q) {
        keys[i] = hilbertOrder(ql[i], qr[i], 17, 0)
        order[i] = i
        i += 1
    }
    sort(order, key: { qi: Int64 => keys[qi] })

    let c = Array<Int64>(maxA + 1, { _ => 0 })
    let up2 = Array<Int64>(maxA + 1, { _ => 0 })
    let out = Array<Int64>(q, { _ => 0 })
    var curL: Int64 = 0
    var curR: Int64 = -1
    var curAns: Int64 = 0
    for (qi in order) {
        let l = ql[qi]
        let r = qr[qi]
        while (curL > l) {
            curL -= 1
            curAns = addElem(curL, gv, subs, c, up2, curAns)
        }
        while (curR < r) {
            curR += 1
            curAns = addElem(curR, gv, subs, c, up2, curAns)
        }
        while (curL < l) {
            curAns = removeElem(curL, gv, subs, c, up2, curAns)
            curL += 1
        }
        while (curR > r) {
            curAns = removeElem(curR, gv, subs, c, up2, curAns)
            curR -= 1
        }
        out[qi] = curAns
    }

    let sb = StringBuilder()
    i = 0
    while (i < q) {
        sb.append(out[i])
        sb.append("\n")
        i += 1
    }
    print(sb.toString())
    return 0
}
```

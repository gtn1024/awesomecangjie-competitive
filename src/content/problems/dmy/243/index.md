---
oj: dmy
pid: '243'
title: '[R39G]数字'
difficulty: 省选
tags:
  - 贪心
  - 数据结构
  - 平衡树
timeLimit: 1s
memoryLimit: 512m
---

## 题目

定义 $m$ 个数的序列 $a_1,a_2,\dots,a_m$ 的权值为

$$
\sum_{b=0}^{29}\left|\left\{\left\lfloor \dfrac{a_i}{2^b}\right\rfloor \middle|\ 1\le i\le m \right\}\right|.
$$

你需要在 $[0,2^{30})$ 范围内选择至多 $n$ 个不同的数组成序列使得权值最大，并且会有 $q$ 次修改，每次新加入一个禁止区间 $[l,r]$，选择的数不能落在任何禁止区间内。每次修改后输出当前最大权值。

> 对于 $100\%$ 的数据，$1\le q\le5\times10^5$，$0\le l\le r<2^{30}$，$0\le n\le10^9$。

## 思路

### 按位独立

权值是每一位 $b\in[0,30)$ 贡献之和，而第 $b$ 位的贡献只关心所有 $a_i$ 右移 $b$ 位后得到的值集合大小。把 $[0,2^{30})$ 按 $b$ 切成 $2^{30-b}$ 个长度为 $2^b$ 的 **块**：$\big[j\cdot 2^b,\,(j+1)\cdot2^b-1\big]$。两个数右移 $b$ 位相等，当且仅当它们落在同一个 $b$ 块里。

如果选了 $m\le n$ 个数，第 $b$ 位能贡献的不同值个数，等于这 $m$ 个数占用的不同 $b$ 块数量。于是第 $b$ 位能达到的上界是

$$
\min\bigl(n,\ \text{可用的 } b\text{ 块数}\bigr).
$$

**关键事实**：这 30 个位的上界可以同时取到。因为可以贪心地让选出的 $n$ 个数落在尽量分散的高位块里，每一位都各自被填满。因此最大权值就是

$$
\mathrm{ans}=\sum_{b=0}^{29}\min\bigl(n,\ 2^{30-b}-F_b\bigr),
$$

其中 $F_b$ 是 **完全落在禁止区间并集内** 的 $b$ 块数量。一个 $b$ 块 $\big[j\cdot2^b,(j+1)2^b-1\big]$ 被完全禁止，当且仅当它整个被某个禁止区间包含。

### 完全禁止块数的计算

对于一个禁止区间 $[l,r]$，它整包含的 $b$ 块数为

$$
g_b(l,r)=\max\!\left(0,\ \left\lfloor\frac{r+1}{2^b}\right\rfloor-\left\lceil\frac{l}{2^b}\right\rceil\right).
$$

由于维护的是不相交区间并集，每个 $b$ 块至多被一个区间整包含，所以 $F_b=\sum_{\text{区间}}g_b$。

### 增量维护

每次加入 $[l,r]$ 时，把它和现有并集中所有 **相交或相邻**（即 $l'\le r+1$ 且 $r'\ge l-1$）的区间合并成一个大区间 $[L,R]$。设被吸收的区间为 $[l_i,r_i]$，则第 $b$ 位 $F_b$ 的增量为

$$
\Delta_b=g_b(L,R)-\sum_i g_b(l_i,r_i).
$$

差值非零时，$\mathrm{ans}$ 在第 $b$ 位上的变化为 $\min(n,2^{30-b}-(F_b+\Delta_b))-\min(n,2^{30-b}-F_b)$，累加即可。

不相交区间按下端点 $l$ 为关键字存入一棵平衡树（实现为迭代式 treap，带父指针），需要支持 **前驱查询**（找最大的 $\le r+1$ 的关键字）、**插入** 与 **删除**。每次吸收若干区间后插入合并后的新区间。由于每个区间至多被吸收一次，吸收总次数是 $O(q)$ 的，所以单次修改均摊 $O\bigl((|吸收|+1)\cdot 30+\log q\bigr)$。

## 复杂度

- 时间复杂度：$O\bigl(30q\log q\bigr)$。
- 空间复杂度：$O(q)$。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*
import std.collection.*

// P243 [R39G] 数字
// answer = sum_b min(n, 2^(B-b) - F_b), F_b = #b-blocks fully in forbidden union.
// Maintain disjoint forbidden intervals in an iterative treap, F_b per bit, and
// the running answer. Each insertion absorbs overlapping/adjacent intervals.

let B: Int64 = 30
let BUFSIZE: Int64 = 15000000

var gKey = ArrayList<Int64>(0)
var gVal = ArrayList<Int64>(0)
var gPri = ArrayList<Int64>(0)
var gLeft = ArrayList<Int64>(0)
var gRight = ArrayList<Int64>(0)
var gParent = ArrayList<Int64>(0)
var gRoot: Int64 = 0
var gRandState: UInt64 = 88172645463325252

func nextRand(): Int64 {
    var x = gRandState
    x = x ^ (x << 13)
    x = x ^ (x >> 7)
    x = x ^ (x << 17)
    gRandState = x
    return Int64(x & UInt64(0x3FFFFFFF))
}

func initTreap(): Unit {
    gKey.add(0)
    gVal.add(0)
    gPri.add(0)
    gLeft.add(0)
    gRight.add(0)
    gParent.add(0)
}

func newNode(k: Int64, v: Int64): Int64 {
    gKey.add(k)
    gVal.add(v)
    gPri.add(nextRand())
    gLeft.add(0)
    gRight.add(0)
    gParent.add(0)
    return gKey.size - 1
}

func rotateUp(node: Int64): Unit {
    let p = gParent[node]
    if (p == 0) {
        return
    }
    let gp = gParent[p]
    if (gLeft[p] == node) {
        gLeft[p] = gRight[node]
        if (gRight[node] != 0) {
            gParent[gRight[node]] = p
        }
        gRight[node] = p
    } else {
        gRight[p] = gLeft[node]
        if (gLeft[node] != 0) {
            gParent[gLeft[node]] = p
        }
        gLeft[node] = p
    }
    gParent[p] = node
    gParent[node] = gp
    if (gp != 0) {
        if (gLeft[gp] == p) {
            gLeft[gp] = node
        } else {
            gRight[gp] = node
        }
    } else {
        gRoot = node
    }
}

func insertNode(k: Int64, v: Int64): Unit {
    let nd = newNode(k, v)
    if (gRoot == 0) {
        gRoot = nd
        return
    }
    var cur = gRoot
    while (true) {
        if (k <= gKey[cur]) {
            if (gLeft[cur] == 0) {
                gLeft[cur] = nd
                gParent[nd] = cur
                break
            }
            cur = gLeft[cur]
        } else {
            if (gRight[cur] == 0) {
                gRight[cur] = nd
                gParent[nd] = cur
                break
            }
            cur = gRight[cur]
        }
    }
    while (gParent[nd] != 0 && gPri[nd] > gPri[gParent[nd]]) {
        rotateUp(nd)
    }
}

// delete node by reference (already located). Rotates it down to a leaf.
func deleteNode(node: Int64): Unit {
    while (gLeft[node] != 0 || gRight[node] != 0) {
        let l = gLeft[node]
        let r = gRight[node]
        var up: Int64 = 0
        if (l == 0) {
            up = r
        } else if (r == 0) {
            up = l
        } else if (gPri[l] > gPri[r]) {
            up = l
        } else {
            up = r
        }
        rotateUp(up)
    }
    let p = gParent[node]
    if (p == 0) {
        gRoot = 0
    } else {
        if (gLeft[p] == node) {
            gLeft[p] = 0
        } else {
            gRight[p] = 0
        }
    }
}

func floorNode(k: Int64): Int64 {
    var node = gRoot
    var best = Int64(0)
    while (node != 0) {
        if (gKey[node] <= k) {
            best = node
            node = gRight[node]
        } else {
            node = gLeft[node]
        }
    }
    return best
}

main(): Int64 {
    initTreap()
    let reader = Console.stdIn
    var buf = Array<Byte>(BUFSIZE, { _ => 0 })
    let nBytes = reader.read(buf)
    var pos = Int64(0)
    let bytes = buf

    // parse n
    var n = Int64(0)
    while (pos < nBytes) {
        let c = bytes[pos]
        if (c >= 48 && c <= 57) {
            break
        }
        pos += 1
    }
    while (pos < nBytes) {
        let c = bytes[pos]
        if (c < 48 || c > 57) {
            break
        }
        n = n * 10 + Int64(c - 48)
        pos += 1
    }
    // parse q
    var q = Int64(0)
    while (pos < nBytes) {
        let c = bytes[pos]
        if (c >= 48 && c <= 57) {
            break
        }
        pos += 1
    }
    while (pos < nBytes) {
        let c = bytes[pos]
        if (c < 48 || c > 57) {
            break
        }
        q = q * 10 + Int64(c - 48)
        pos += 1
    }

    var F = Array<Int64>(B, { _: Int64 => 0 })
    var cap = Array<Int64>(B, { _: Int64 => 0 })
    var ans = Int64(0)
    var bi = Int64(0)
    while (bi < B) {
        let c = Int64(1) << (B - bi)
        cap[bi] = c
        var s = c
        if (s > n) {
            s = n
        }
        ans += s
        bi += 1
    }

    var qi = Int64(0)
    while (qi < q) {
        // parse l
        var l = Int64(0)
        while (pos < nBytes) {
            let c = bytes[pos]
            if (c >= 48 && c <= 57) {
                break
            }
            pos += 1
        }
        while (pos < nBytes) {
            let c = bytes[pos]
            if (c < 48 || c > 57) {
                break
            }
            l = l * 10 + Int64(c - 48)
            pos += 1
        }
        // parse r
        var r = Int64(0)
        while (pos < nBytes) {
            let c = bytes[pos]
            if (c >= 48 && c <= 57) {
                break
            }
            pos += 1
        }
        while (pos < nBytes) {
            let c = bytes[pos]
            if (c < 48 || c > 57) {
                break
            }
            r = r * 10 + Int64(c - 48)
            pos += 1
        }
        qi += 1

        // absorb overlapping/adjacent intervals: floorNode(r+1) while value >= l-1
        var absorbedL = ArrayList<Int64>(0)
        var absorbedR = ArrayList<Int64>(0)
        var L = l
        var R = r
        var keepGoing = true
        while (keepGoing) {
            let nd = floorNode(r + 1)
            if (nd == 0) {
                keepGoing = false
            } else {
                let kl = gKey[nd]
                let rv = gVal[nd]
                if (rv >= l - 1) {
                    absorbedL.add(kl)
                    absorbedR.add(rv)
                    if (kl < L) {
                        L = kl
                    }
                    if (rv > R) {
                        R = rv
                    }
                    deleteNode(nd)
                } else {
                    keepGoing = false
                }
            }
        }

        // per-bit delta update
        let asize = absorbedL.size
        var bb = Int64(0)
        while (bb < B) {
            let size = Int64(1) << bb
            let hiM = (R + 1) / size
            let loM = (L + size - 1) / size
            var fm = hiM - loM
            if (fm < 0) {
                fm = 0
            }
            var delta = fm
            var ai2 = Int64(0)
            while (ai2 < asize) {
                let al = absorbedL[ai2]
                let ar = absorbedR[ai2]
                let hiA = (ar + 1) / size
                let loA = (al + size - 1) / size
                var da = hiA - loA
                if (da < 0) {
                    da = 0
                }
                delta -= da
                ai2 += 1
            }
            if (delta != 0) {
                var oldS = cap[bb] - F[bb]
                if (oldS > n) {
                    oldS = n
                }
                F[bb] += delta
                var newS = cap[bb] - F[bb]
                if (newS > n) {
                    newS = n
                }
                ans += newS - oldS
            }
            bb += 1
        }

        insertNode(L, R)
        println(ans)
    }
    return 0
}
```

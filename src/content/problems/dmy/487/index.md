---
oj: dmy
pid: '487'
title: '[R78G] 信标'
difficulty: 提高+
tags:
  - 基环树
  - 前后缀最小值
  - 二分查找
  - 深度优先搜索
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$1 \le f_i, c_i \le n$。

## 思路

每个点出度为 $1$，整张图是若干 **基环树**（一棵指向一个环的树）的集合。一次巡游访问的节点颜色两两不同，停在第一个「颜色在本次巡游中已出现过」的节点处。设 $W(v)$ 为从 $v$ 出发巡游访问的节点序列（其中颜色全不同），$\mathrm{ans}(v)=|W(v)|$。

**树上递推。** 对非环节点 $w$（父亲 $u=f_w$），从 $w$ 出发先访问 $w$，随后等价于「从 $u$ 出发、但初始已占用颜色 $c_w$」的巡游，因此

$$\mathrm{ans}(w) = 1 + \min\big(\mathrm{ans}(u),\ \mathrm{pos}(u, c_w)\big),$$

其中 $\mathrm{pos}(u, x)$ 是颜色 $x$ 在 $W(u)$ 中首次出现的位置（不存在则为 $+\infty$）。由于 $W(u)$ 内颜色全不同，同一颜色至多出现一次。

**环上公式。** 设某环为 $v_0, v_1, \dots, v_{L-1}$（$f_{v_i}=v_{(i+1) \bmod L}$）。令 $d_i$ 为从 $v_{i+1}$ 出发沿环走到第一个颜色为 $c_{v_i}$ 的节点的距离（必然存在：走完一圈回到 $v_i$ 即可，$0 \le d_i \le L-1$）。从 $v_i$ 出发要么在 $d_i$ 步内撞上同色节点，要么接续 $v_{i+1}$ 的巡游，于是

$$\mathrm{ans}(v_i) = 1 + \min\big(d_i,\ 1 + \min(d_{i+1},\ 1 + \min(\dots))\big) = 1 + \min_{0 \le k < L}\big(k + d_{(i+k) \bmod L}\big).$$

令 $w_j = d_j + j$，把下标按是否绕过环尾分类，可得 $\min_{k}\big(k + d_{(i+k) \bmod L}\big) = \min\big(\min_{j \ge i} w_j - i,\ L + \min_{j < i} w_j - i\big)$，前后缀最小值 $O(L)$ 求出。

**如何求 $\mathrm{pos}(u, c_w)$。** 把每棵树以环上节点 $r$ 为根做 DFS。对当前节点 $u$（深度 $\mathrm{dep}_u$，$\mathrm{dep}_r=0$）：

- 若 $c_w$ 在 $r$ 到 $u$ 的树链上出现过，取 **最深** 的那个，位置为 $\mathrm{dep}_u - \mathrm{dep}$（越深离 $u$ 越近）；
- 否则若 $c_w$ 在环上出现过，设距 $r$ 沿环最近为 $D$，位置为 $\mathrm{dep}_u + D$（环上的部分在 $W(u)$ 中位于整棵树链之后）；
- 两者取较小者；都不存在则为 $+\infty$。

DFS 过程中维护「颜色 $\to$ 当前栈中该颜色节点的最大深度」数组（出栈时恢复旧值），即可 $O(1)$ 回答树链部分；环上部分对每个颜色预处理它在环上的所有出现位置（天然有序），每次查询二分 $O(\log L)$。注意 $W(u)$ 会延伸到环上并绕过若干个环节点，但外层已用 $\min$ 与 $\mathrm{ans}(u)$ 比较，天然处理了截断。

## 复杂度

时间 $O(n \log n)$（环上颜色位置的二分查询，总计 $O(n \log n)$；建图、找环、前后缀最小值均为线性），空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*
import std.collection.*

func mn(a: Int64, b: Int64): Int64 {
    if (a < b) {
        return a
    }
    return b
}

main() {
    let INF: Int64 = 1000000000000000000
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let f = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let cc = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let nn = n
    var i: Int64 = 0
    while (i < nn) {
        f[i] -= 1
        i += 1
    }

    // 入度消除找环
    var inDeg = Array<Int64>(nn, { _ => 0 })
    i = 0
    while (i < nn) {
        inDeg[f[i]] += 1
        i += 1
    }
    var q = ArrayList<Int64>()
    i = 0
    while (i < nn) {
        if (inDeg[i] == 0) {
            q.add(i)
        }
        i += 1
    }
    var qh: Int64 = 0
    while (qh < q.size) {
        let u = q[qh]
        qh += 1
        let p = f[u]
        inDeg[p] -= 1
        if (inDeg[p] == 0) {
            q.add(p)
        }
    }
    var isCyc = Array<Bool>(nn, { _ => false })
    var cycCnt: Int64 = 0
    i = 0
    while (i < nn) {
        if (inDeg[i] > 0) {
            isCyc[i] = true
            cycCnt += 1
        }
        i += 1
    }

    // 反图（树边，排除环上点）CSR
    var off = Array<Int64>(nn + 1, { _ => 0 })
    i = 0
    while (i < nn) {
        if (!isCyc[i]) {
            off[f[i] + 1] += 1
        }
        i += 1
    }
    i = 0
    while (i < nn) {
        off[i + 1] += off[i]
        i += 1
    }
    var childArr = Array<Int64>(nn - cycCnt, { _ => 0 })
    var cur = Array<Int64>(nn, { _ => 0 })
    i = 0
    while (i < nn) {
        cur[i] = off[i]
        i += 1
    }
    i = 0
    while (i < nn) {
        if (!isCyc[i]) {
            childArr[cur[f[i]]] = i
            cur[f[i]] += 1
        }
        i += 1
    }

    var ans = Array<Int64>(nn, { _ => 0 })
    var dep = Array<Int64>(nn, { _ => 0 })
    // 颜色 -> 当前 DFS 路径上该颜色节点的最大深度（-1 表示不存在）
    var treeDep = Array<Int64>(nn + 1, { _ => -1 })
    var prevSave = Array<Int64>(nn, { _ => -1 })

    var done = Array<Bool>(nn, { _ => false })
    var cycList = ArrayList<Int64>()
    var stU = ArrayList<Int64>()
    var stP = ArrayList<Int64>()

    var s: Int64 = 0
    while (s < nn) {
        if (isCyc[s] && !done[s]) {
            cycList.clear()
            var j = s
            while (!done[j]) {
                done[j] = true
                cycList.add(j)
                j = f[j]
            }
            let L = cycList.size

            // 环上每种颜色的出现位置（按环序递增）
            var occ = HashMap<Int64, ArrayList<Int64>>()
            var k: Int64 = 0
            while (k < L) {
                let colv = cc[cycList[k]]
                if (occ.contains(colv)) {
                    occ[colv].add(k)
                } else {
                    var l2 = ArrayList<Int64>()
                    l2.add(k)
                    occ.add(colv, l2)
                }
                k += 1
            }

            // d_i：从 v_{i+1} 出发到第一个颜色同 v_i 的节点的距离
            var d = Array<Int64>(L, { _ => 0 })
            var i2: Int64 = 0
            while (i2 < L) {
                let lst = occ[cc[cycList[i2]]]
                var lo: Int64 = 0
                var hi: Int64 = lst.size
                while (lo < hi) {
                    let mid = (lo + hi) / 2
                    if (lst[mid] > i2) {
                        hi = mid
                    } else {
                        lo = mid + 1
                    }
                }
                if (lo < lst.size) {
                    d[i2] = lst[lo] - i2 - 1
                } else {
                    d[i2] = lst[0] + L - i2 - 1
                }
                i2 += 1
            }

            // ans[v_i] = 1 + min_{k>=0} (k + d_{i+k})，前后缀最小值 O(L)
            var wv = Array<Int64>(L, { _ => 0 })
            i2 = 0
            while (i2 < L) {
                wv[i2] = d[i2] + i2
                i2 += 1
            }
            var suf = Array<Int64>(L, { _ => 0 })
            suf[L - 1] = wv[L - 1]
            var k2: Int64 = L - 2
            while (k2 >= 0) {
                suf[k2] = mn(wv[k2], suf[k2 + 1])
                k2 -= 1
            }
            var pre = Array<Int64>(L, { _ => 0 })
            pre[0] = wv[0]
            i2 = 1
            while (i2 < L) {
                pre[i2] = mn(wv[i2], pre[i2 - 1])
                i2 += 1
            }
            i2 = 0
            while (i2 < L) {
                var best: Int64 = suf[i2] - i2
                if (i2 > 0) {
                    best = mn(best, L + pre[i2 - 1] - i2)
                }
                ans[cycList[i2]] = 1 + best
                i2 += 1
            }

            // 每棵环根树的迭代 DFS
            i2 = 0
            while (i2 < L) {
                let r = cycList[i2]
                stU.clear()
                stP.clear()
                stU.add(r)
                stP.add(off[r])
                dep[r] = 0
                prevSave[r] = treeDep[cc[r]]
                treeDep[cc[r]] = 0
                while (stU.size > 0) {
                    let top = stU.size - 1
                    let u = stU[top]
                    if (stP[top] < off[u + 1]) {
                        let wnode = childArr[stP[top]]
                        stP[top] = stP[top] + 1
                        let colw = cc[wnode]
                        var pos: Int64 = INF
                        if (treeDep[colw] >= 0) {
                            pos = dep[u] - treeDep[colw]
                        }
                        if (occ.contains(colw)) {
                            let lst = occ[colw]
                            var lo2: Int64 = 0
                            var hi2: Int64 = lst.size
                            while (lo2 < hi2) {
                                let mid = (lo2 + hi2) / 2
                                if (lst[mid] >= i2) {
                                    hi2 = mid
                                } else {
                                    lo2 = mid + 1
                                }
                            }
                            var dist: Int64 = 0
                            if (lo2 < lst.size) {
                                dist = lst[lo2] - i2
                            } else {
                                dist = lst[0] + L - i2
                            }
                            pos = mn(pos, dep[u] + dist)
                        }
                        ans[wnode] = 1 + mn(ans[u], pos)
                        dep[wnode] = dep[u] + 1
                        prevSave[wnode] = treeDep[colw]
                        treeDep[colw] = dep[wnode]
                        stU.add(wnode)
                        stP.add(off[wnode])
                    } else {
                        treeDep[cc[u]] = prevSave[u]
                        stU.remove(at: top)
                        stP.remove(at: top)
                    }
                }
                i2 += 1
            }
        }
        s += 1
    }

    var sb = StringBuilder()
    i = 0
    while (i < nn) {
        if (i > 0) {
            sb.append(" ")
        }
        sb.append(ans[i])
        i += 1
    }
    println(sb.toString())
}
```

</details>

---
oj: dmy
pid: '572'
title: '剪掉'
difficulty: 普及+
tags:
  - 结论
  - 枚举
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2\times 10^5$，$1 \le a_i \le n$。

## 思路

先把原序列压缩成**极长连续段**（run）序列 $b_1,\dots,b_m$：每段是一个极大的同值连续块，相邻两段的值必然不同。删掉 $x$ 之后每场连续，等价于在段序列里删掉所有值为 $x$ 的段、再把相邻的同值段合并后，每个值只剩一段。

对某个值 $v\ne x$，它的各个段要合并成一段，充要条件是：**任意两个相邻的 $v$ 段之间的段全部被删掉**。而段序列相邻两段值不同，若中间全是 $x$ 的段，则恰好只有一个段（否则会出现相邻两个 $x$ 段，矛盾）。于是得到关键结论：

> 删 $x$ 合法 $\iff$ 对每个段数 $\ge 2$ 的值 $v\ne x$，$v$ 的每对相邻段之间都恰好隔着一个值为 $x$ 的段。

据此给每个段数 $\ge 2$ 的值 $v$ 求约束：扫描段序列，比较 $v$ 相邻两次出现的下标 $p$ 与 $q$——

- 若 $q=p+2$，夹层值为 $b_{p+1}$；要求所有夹层值一致，记为 $u$；
- 若 $q>p+2$，或出现了不同的夹层值，则除 $v$ 自身外无解。

即 $v$ 对答案的限制是 $x\in\{v\}$ 或 $x\in\{v,u\}$（$u$ 为统一的夹层值）。特别地：

- 若所有值都只有一段，序列本来就合法，剪掉任何一场都行，全部出现过的值都是答案；
- 否则任取一个段数 $\ge 2$ 的值 $v_1$，合法的 $x$ 只可能是 $v_1$ 与其夹层值 $u$（若存在）这两个候选，对每个候选再花 $O(n)$ 枚举所有值验证约束即可。

总复杂度 $O(n)$。

样例 1 的段序列为 $1,2,1,2,1,3$：值 $1$ 的两对相邻段夹层都是 $2$，值 $2$ 的相邻段夹层是 $1$，故候选 $x\in\{1,2\}$ 且互相满足约束，输出 $1$ 和 $2$。

## 代码

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // 先压缩成极长连续段（run）序列
    let runs = Array<Int64>(n, { _ => 0 })
    var m: Int64 = 0
    for (i in 0..n) {
        if (i == 0 || a[i] != a[i - 1]) {
            runs[m] = a[i]
            m += 1
        }
    }

    let NIL: Int64 = -1
    let lastRun = Array<Int64>(n + 1, { _ => NIL })
    // middle[v]：v 的相邻两个段之间若恰好只夹一个段，记录夹层值；出现不同夹层或有更宽的间隔则 bad
    let middle = Array<Int64>(n + 1, { _ => NIL })
    let bad = Array<Bool>(n + 1, { _ => false })
    let multi = Array<Bool>(n + 1, { _ => false })

    for (i in 0..m) {
        let v = runs[i]
        if (lastRun[v] == NIL) {
            lastRun[v] = i
        } else {
            multi[v] = true
            let p = lastRun[v]
            if (i == p + 2) {
                let mid = runs[i - 1]
                if (middle[v] == NIL) {
                    middle[v] = mid
                } else if (middle[v] != mid) {
                    bad[v] = true
                }
            } else {
                bad[v] = true
            }
            lastRun[v] = i
        }
    }

    var v1: Int64 = -1
    for (v in 1..=n) {
        if (multi[v]) {
            v1 = v
            break
        }
    }

    if (v1 == -1) {
        // 每场都已经连续，剪掉任何一场都行
        var cnt: Int64 = 0
        for (v in 1..=n) {
            if (lastRun[v] != NIL) {
                cnt += 1
            }
        }
        println(cnt)
        if (cnt > 0) {
            var sb = StringBuilder()
            var first = true
            for (v in 1..=n) {
                if (lastRun[v] != NIL) {
                    if (first) {
                        first = false
                    } else {
                        sb.append(" ")
                    }
                    sb.append(v)
                }
            }
            println(sb.toString())
        }
    } else {
        // 候选只有 v1 与夹层值 u（若存在）
        var ok1 = true
        for (v in 1..=n) {
            if (multi[v] && v != v1) {
                if (bad[v] || middle[v] != v1) {
                    ok1 = false
                    break
                }
            }
        }
        var u: Int64 = -1
        if (!bad[v1] && middle[v1] != NIL) {
            u = middle[v1]
        }
        var ok2 = false
        if (u != -1) {
            ok2 = true
            for (v in 1..=n) {
                if (multi[v] && v != u) {
                    if (bad[v] || middle[v] != u) {
                        ok2 = false
                        break
                    }
                }
            }
        }
        if (ok1 && ok2) {
            if (v1 < u) {
                println(2)
                println("${v1} ${u}")
            } else {
                println(2)
                println("${u} ${v1}")
            }
        } else if (ok1) {
            println(1)
            println(v1)
        } else if (ok2) {
            println(1)
            println(u)
        } else {
            println(0)
        }
    }
}
```

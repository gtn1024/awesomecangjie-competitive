---
oj: dmy
pid: '484'
title: '[R78D] 摄影'
difficulty: 普及+/提高
tags:
  - 差分
  - 离散化
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$2 \le m \le 10^{18}$，$1 \le d < m$，$1 \le l_i \le r_i \le m$，$1 \le w_i \le 10^9$。

## 思路

记 $S(t)$ 为时刻 $t$ 所有出现对象的权值之和。选定 $x$ 后两张照片的时刻为 $x$ 与 $x+d$，合法范围是 $x \in [1, m-d]$。

对象 $i$ 贡献 $w_i$ 当且仅当 $x$、$x+d$ 中恰好有一个落在 $[l_i, r_i]$ 内。再记 $B(x)$ 为两个时刻都被覆盖的对象权值之和，则总分

$$f(x) = S(x) + S(x+d) - 2B(x).$$

三项关于 $x$ 都是分段常数函数，分别对应区间加：

- $x \in [l_i, r_i]$ 时 $S(x)$ 包含 $w_i$；
- $x \in [l_i - d, r_i - d]$ 时 $S(x + d)$ 包含 $w_i$；
- 两个时刻都落入 $[l_i, r_i]$ 即 $x \in [l_i, r_i - d]$（仅当 $r_i - l_i \ge d$ 时非空）时 $B(x)$ 包含 $w_i$。

于是每个对象拆成至多三段区间加，用差分转成事件：左端点加、右端点加一的位置减。事件坐标可能超出定义域 $[1, m-d]$，统一截断：小于 $1$ 的提到 $1$（对定义域起点同样生效），大于 $m-d$ 的直接丢弃。

把所有事件坐标排序后扫描：相邻事件坐标之间 $f(x)$ 保持不变，用当前值更新最大值，达到最大值的 $x$ 个数累加该段长度。注意最后一个事件坐标到 $m-d$ 的尾巴也要计入。$m$ 高达 $10^{18}$，但事件只有 $O(n)$ 个，无需逐时刻枚举。

## 复杂度

每个对象产生常数个事件，共 $O(n)$ 个；排序 $O(n \log n)$，扫描 $O(n)$。总时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

分数上界约 $2 \times 10^{14}$、方案数上界 $m - d$ 约 $10^{18}$，都在 `Int64` 范围内。

## 仓颉实现

```cangjie
import std.env.*
import std.collection.*
import std.sort.*

var gdata = Array<Byte>(0, { _ => 0 })
var gpos: Int64 = 0

func nextInt(): Int64 {
    while (gpos < gdata.size && Int64(gdata[gpos]) <= 32) { gpos += 1 }
    var x: Int64 = 0
    while (gpos < gdata.size && Int64(gdata[gpos]) > 32) {
        x = x * 10 + Int64(gdata[gpos]) - 48
        gpos += 1
    }
    return x
}

func addEv(diff: HashMap<Int64, Int64>, c0: Int64, v: Int64, limit: Int64): Unit {
    var c = c0
    if (c < 1) {
        c = 1
    }
    if (c > limit) {
        return
    }
    if (diff.contains(c)) {
        diff[c] = diff[c] + v
    } else {
        diff[c] = v
    }
}

main() {
    gdata = getStdIn().readToEnd().getOrThrow().toArray()
    let n = nextInt()
    let m = nextInt()
    let d = nextInt()
    let limit = m - d

    // f(x) = S(x) + S(x+d) - 2*B(x)，对 x 做差分事件扫描
    let diff = HashMap<Int64, Int64>()
    for (_ in 0..n) {
        let l = nextInt()
        let r = nextInt()
        let w = nextInt()
        // S(x)：x 落入 [l, r]
        addEv(diff, l, w, limit)
        addEv(diff, r + 1, -w, limit)
        // S(x+d)：x+d 落入 [l, r]，即 x 落入 [l-d, r-d]
        addEv(diff, l - d, w, limit)
        addEv(diff, r + 1 - d, -w, limit)
        // B(x)：x 与 x+d 都落入 [l, r]，即 x 落入 [l, r-d]
        if (r - d >= l) {
            addEv(diff, l, -2 * w, limit)
            addEv(diff, r - d + 1, 2 * w, limit)
        }
    }

    let keys = diff.keys().toArray()
    sort(keys)

    var best: Int64 = -1
    var cnt: Int64 = 0
    var cur: Int64 = 1
    var val: Int64 = 0
    for (c in keys) {
        if (c > cur) {
            let len = c - cur
            if (val > best) {
                best = val
                cnt = len
            } else if (val == best) {
                cnt += len
            }
        }
        val += diff[c]
        cur = c
    }
    let tail = limit - cur + 1
    if (tail > 0) {
        if (val > best) {
            best = val
            cnt = tail
        } else if (val == best) {
            cnt += tail
        }
    }
    println("${best} ${cnt}")
}
```

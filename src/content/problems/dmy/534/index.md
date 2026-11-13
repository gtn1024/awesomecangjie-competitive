---
oj: dmy
pid: '534'
title: '[R83E] 顺序'
difficulty: 提高+/省选-
tags:
  - 图论
  - 拓扑排序
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2\times 10^5$，$0 \le m \le \min\left(2\times 10^5, \frac{n(n-1)}{2}\right)$，$0 \le a_i \le 10^9$，图无重边、不保证连通。

## 思路

**读数只减不增。** 调节设备 $u$ 时，新读数是自己与所有邻居当前读数的最小值，因此每台设备的读数在整过程中单调不增。

**上界。** 记

$$b_u=\min\left(a_u,\ \min_{v\sim u}a_v\right),$$

即 $u$ 的闭邻域（自己加所有邻居）初始读数的最小值，孤立点就是 $a_u$。调节 $u$ 的那一刻，它读到的每个当前读数都不超过该设备对应的初始读数，所以这次调节后 $u$ 的读数不超过 $b_u$；其后读数只减不增，于是全过程结束时 $u$ 的读数不超过 $b_u$。由此总和不超过 $\sum b_u$。

**哪些顺序能达到上界。** 考虑一条边 $(u,v)$，设 $b_u>b_v$。若顺序中 $v$ 排在 $u$ 之前，那么 $v$ 调节时 $u$ 尚未调节、读到的仍是 $a_u$，$v$ 的读数被压到不超过 $a_u$，而它无论如何不超过 $b_v$；等 $u$ 调节时，$v$ 的读数已经定格且不超过 $b_v<b_u$，于是 $u$ 这次调节后的读数严格小于 $b_u$，总和达不到上界。所以必要条件为：

> 对每条边 $(u,v)$，若 $b_u>b_v$，则 $u$ 必须排在 $v$ 之前。

这个条件也是充分的。设顺序满足它，归纳证明每台设备调节后恰好等于 $b_u$。设备 $u$ 调节时，三类读数都 $\ge b_u$：

- 自身读数仍为 $a_u\ge b_u$（尚未被调节，且读数单调不增）；
- 已调节的邻居 $x$：按归纳假设其读数为 $b_x$，而约束保证 $b_x\ge b_u$（若 $b_x<b_u$ 就要求 $x$ 排在 $u$ 之后，矛盾）；
- 未调节的邻居 $y$：读数仍是 $a_y\ge b_u$。

同时 $b_u$ 一定会被取到：若 $b_u=a_u$，自身读数就是 $b_u$；否则存在邻居 $w$ 使 $a_w=b_u$，它若已调节则读数为 $b_w\le a_w=b_u$ 且 $b_w\ge b_u$，故 $b_w=b_u$，它若未调节则读数正是 $a_w=b_u$。于是最小值为 $b_u$ 本身。

因此：一个顺序能达到最大值 $\sum b_u$，当且仅当它满足上述全部先后约束。注意 $b$ 相等的相邻点之间没有任何约束，两者先后任意。

**字典序最小。** 对每条边，若 $b_u>b_v$ 就连有向边 $u\to v$。每条边都从 $b$ 较大的一端指向较小的一端，故这张图无环；上述约束等价于「该顺序是这张 DAG 的拓扑序」。求字典序最小的拓扑序：每一步在当前入度为 $0$ 的编号中取最小者。因为已释放的点不会重新变得不可用，先放小号只会让后续可选的集合更大，贪心正确。用小根堆维护当前可选集合即可。

## 复杂度

时间 $O(n+m+(n+m)\log n)$，空间 $O(n+m)$。

## 仓颉实现

读入量达到 $10^6$ 级别，使用整块读入加手写扫描。邻接关系用 CSR 存储（前缀和定位每个点的出边区间），小根堆手写，只需插入与取最小值。

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*

var gdata = Array<Byte>(0, { _ => 0 })
var gpos: Int64 = 0

func nextInt(): Int64 {
    while (gpos < gdata.size && Int64(gdata[gpos]) <= 32) {
        gpos += 1
    }
    var x: Int64 = 0
    while (gpos < gdata.size && Int64(gdata[gpos]) > 32) {
        x = x * 10 + Int64(gdata[gpos]) - 48
        gpos += 1
    }
    return x
}

var gheap = Array<Int64>(1, { _ => 0 })
var gheapSize: Int64 = 0

func heapPush(x: Int64) {
    gheapSize += 1
    var i = gheapSize
    gheap[i] = x
    while (i > 1 && gheap[i] < gheap[i / 2]) {
        let t = gheap[i]
        gheap[i] = gheap[i / 2]
        gheap[i / 2] = t
        i = i / 2
    }
}

func heapPop(): Int64 {
    let res = gheap[1]
    gheap[1] = gheap[gheapSize]
    gheapSize -= 1
    var i: Int64 = 1
    while (true) {
        var s = i
        let l = i * 2
        let r = i * 2 + 1
        if (l <= gheapSize && gheap[l] < gheap[s]) {
            s = l
        }
        if (r <= gheapSize && gheap[r] < gheap[s]) {
            s = r
        }
        if (s == i) {
            break
        }
        let t = gheap[i]
        gheap[i] = gheap[s]
        gheap[s] = t
        i = s
    }
    return res
}

main() {
    gdata = getStdIn().readToEnd().getOrThrow().toArray()
    let n = nextInt()
    let m = nextInt()
    let a = Array<Int64>(n + 1, { _ => 0 })
    for (i in 1..=n) {
        a[i] = nextInt()
    }
    let eu = Array<Int64>(m, { _ => 0 })
    let ev = Array<Int64>(m, { _ => 0 })
    let b = Array<Int64>(n + 1, { _ => 0 })
    for (i in 1..=n) {
        b[i] = a[i]
    }
    for (i in 0..m) {
        let u = nextInt()
        let v = nextInt()
        eu[i] = u
        ev[i] = v
        if (a[v] < b[u]) {
            b[u] = a[v]
        }
        if (a[u] < b[v]) {
            b[v] = a[u]
        }
    }
    var total: Int64 = 0
    for (i in 1..=n) {
        total += b[i]
    }
    println(total)

    let start = Array<Int64>(n + 2, { _ => 0 })
    let indeg = Array<Int64>(n + 1, { _ => 0 })
    for (i in 0..m) {
        let u = eu[i]
        let v = ev[i]
        if (b[u] > b[v]) {
            start[u + 1] = start[u + 1] + 1
            indeg[v] = indeg[v] + 1
        } else if (b[v] > b[u]) {
            start[v + 1] = start[v + 1] + 1
            indeg[u] = indeg[u] + 1
        }
    }
    for (i in 1..=n) {
        start[i + 1] = start[i + 1] + start[i]
    }
    let cur = Array<Int64>(n + 2, { i => start[i] })
    let to = Array<Int64>(m, { _ => 0 })
    for (i in 0..m) {
        let u = eu[i]
        let v = ev[i]
        if (b[u] > b[v]) {
            to[cur[u]] = v
            cur[u] = cur[u] + 1
        } else if (b[v] > b[u]) {
            to[cur[v]] = u
            cur[v] = cur[v] + 1
        }
    }

    gheap = Array<Int64>(n + 2, { _ => 0 })
    gheapSize = 0
    for (i in 1..=n) {
        if (indeg[i] == 0) {
            heapPush(i)
        }
    }
    let ans = Array<Int64>(n, { _ => 0 })
    for (k in 0..n) {
        let u = heapPop()
        ans[k] = u
        for (e in start[u]..start[u + 1]) {
            let v = to[e]
            indeg[v] = indeg[v] - 1
            if (indeg[v] == 0) {
                heapPush(v)
            }
        }
    }
    let sb = StringBuilder()
    for (k in 0..n) {
        if (k > 0) {
            sb.append(" ")
        }
        sb.append(ans[k])
    }
    println(sb.toString())
}
```

</details>

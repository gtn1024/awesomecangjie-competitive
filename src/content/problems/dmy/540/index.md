---
oj: dmy
pid: '540'
title: '最佳加油路径'
difficulty: 提高+
tags:
  - 树形DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1\le n\le 3\times 10^5$，$0\le w_i\le 10^9$，$1\le c\le 10^9$。

## 思路

**把一条路径写成一串增量。** 设行驶路径为 $v_0,v_1,\dots,v_k$，$v_i$ 与 $v_{i+1}$ 之间的边长为 $c_i$。起点油量为 $0$，而每个城市都加满总是最优（油只会被消耗，多加油不会让后面的约束变紧），所以整条路径的油量完全由路径本身决定。把「加油」与「扣油」交替排开：

$$w_{v_0},\ -c_0,\ w_{v_1},\ -c_1,\ \dots,\ -c_{k-1},\ w_{v_k}$$

记前缀和 $P_0=w_{v_0}$，$P_{2i+1}=P_{2i}-c_i$（刚到达 $v_{i+1}$、尚未加油），$P_{2i+2}=P_{2i+1}+w_{v_{i+1}}$。「行驶中油量不能为负」恰好等价于**所有前缀和非负**。到达终点加油后的剩余油量就是末项

$$G=P_{2k}=\sum_{i=0}^{k} w_{v_i}-\sum_{i=0}^{k-1} c_i ,$$

即路径的总增益。

**关键结论：可行性不构成额外限制。** 任取一条路径，若它本身走不通，设 $P_j=m<0$ 是第一个取到最小值的位置：

- $j=2i+1$ 为奇数，表示刚扣完第 $i$ 条边、停在城市 $v_{i+1}$ 上。改从 $v_{i+1}$ 出发截下后半段：新路径的每个前缀和都等于原前缀和减去 $m$，全部非负，因此可行；而新路径的增益是 $G-m>G$。
- $j=2i$ 为偶数且 $i<k$，表示刚在 $v_i$ 加完油。改从 $v_{i+1}$ 出发，此时被扔掉的那一段之和是 $P_{2i+1}=m-c_i$，新路径的每个前缀和等于原前缀和减去 $P_{2i+1}$，至少为 $m-(m-c_i)=c_i>0$，仍然可行；新增益为 $G-m+c_i>G$。
- $j$ 是末项 $2k$：说明 $G$ 是所有前缀和的最小值。而单点路径的增益 $w\ge 0$，最优值不可能为负，于是 $P_j=G\ge0$，所有前缀和非负，这条路径本来就走得通。

也就是说，任何一条路径要么本身可行，要么把起点往终点方向缩短一截就能可行，而且剩余油量只会变得更多。所有可行路径的集合包含于所有路径的集合，而后者中的最优者（或比它更好的某个缩短版）一定可行，所以答案就是

$$\max_{\text{树上路径}}\Big(\sum_{v\in\text{路径}} w_v-\sum_{e\in\text{路径}} c_e\Big).$$

路径至少包含一个点，对应题目允许的「只停留在一个城市」。

**树形 DP 求最大权路径。** 把点权取作 $w_v$、边权取作 $-c_e$。以 $1$ 为根自底向上计算：

- $down_v$：从 $v$ 出发只向下走（也可以只含 $v$）能取得的路径最大权值，
  $$down_v=w_v+\max\Big(0,\ \max_{u\in son(v)}\big(down_u-c_{v,u}\big)\Big);$$
- 以 $v$ 为最高点、两条腿伸向不同儿子的路径，权值为 $w_v+t_1+t_2$，其中 $t_1,t_2$ 是各儿子 $u$ 的 $\max(0,down_u-c_{v,u})$ 中最大的两个（不足两个时用 $0$ 补齐）。

对所有 $v$ 取最大值即为答案。注意 $n$ 达到 $3\times 10^5$，要写成迭代 DFS 以免栈溢出；输入约 $9\times 10^5$ 个整数，需要整块读入后手写扫描。

## 复杂度

时间与空间均为 $O(n)$。

## 仓颉实现

<details><summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

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

main() {
    gdata = getStdIn().readToEnd().getOrThrow().toArray()
    let n = nextInt()
    let w = Array<Int64>(n, { _ => 0 })
    for (i in 0..n) {
        w[i] = nextInt()
    }
    let m = 2 * (n - 1)
    let head = Array<Int64>(n, { _ => -1 })
    let to = Array<Int64>(m, { _ => 0 })
    let nxt = Array<Int64>(m, { _ => 0 })
    let cst = Array<Int64>(m, { _ => 0 })
    var ec: Int64 = 0
    for (i in 0..(n - 1)) {
        let u = nextInt() - 1
        let v = nextInt() - 1
        let c = nextInt()
        for (k in 0..2) {
            let a = if (k == 0) { u } else { v }
            let b = if (k == 0) { v } else { u }
            to[ec] = b
            cst[ec] = c
            nxt[ec] = head[a]
            head[a] = ec
            ec += 1
        }
    }
    let par = Array<Int64>(n, { _ => -1 })
    let order = Array<Int64>(n, { _ => 0 })
    var cnt: Int64 = 0
    par[0] = -2
    order[0] = 0
    cnt = 1
    var qi: Int64 = 0
    while (qi < cnt) {
        let v = order[qi]
        qi += 1
        var e = head[v]
        while (e != -1) {
            let u = to[e]
            if (u != par[v]) {
                par[u] = v
                order[cnt] = u
                cnt += 1
            }
            e = nxt[e]
        }
    }
    let down = Array<Int64>(n, { _ => 0 })
    var ans: Int64 = 0
    var idx: Int64 = cnt - 1
    while (idx >= 0) {
        let v = order[idx]
        var t1: Int64 = 0
        var t2: Int64 = 0
        var e = head[v]
        while (e != -1) {
            let u = to[e]
            if (u != par[v]) {
                let x = down[u] - cst[e]
                if (x > t1) {
                    t2 = t1
                    t1 = x
                } else if (x > t2) {
                    t2 = x
                }
            }
            e = nxt[e]
        }
        down[v] = w[v] + t1
        let cand = w[v] + t1 + t2
        if (cand > ans) { ans = cand }
        idx -= 1
    }
    println(ans)
}
```

</details>

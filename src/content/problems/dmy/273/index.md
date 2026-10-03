---
oj: dmy
pid: '273'
title: '[R44E]路径数为K'
difficulty: 提高
tags:
  - 构造
  - 图论
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$T \le 100$，$K \le 10^9$，构造的图要求 $n \le 50$ 且无重边。

## 思路

要求构造一个点数不超过 50 的 DAG，使得从顶点 $1$ 到顶点 $n$ 的路径数恰好为 $K$。直接按二进制逐位倍增（每层两个节点）需要约 60 个点，超过 50 的限制，因此改用**斐波那契**拆解：每层只用一个节点，路径数以斐波那契速度增长。

构造一条链 $c_0, c_1, c_2, \dots$：

- $c_0$ 就是起点 $1$，规定路径数 $f(c_0) = 1$；
- $c_1$ 只从 $c_0$ 连过来，$f(c_1) = 1$；
- 对 $i \ge 2$，$c_i$ 从 $c_{i-1}$ 和 $c_{i-2}$ 各连一条入边，于是 $f(c_i) = f(c_{i-1}) + f(c_{i-2})$，即 $f(c_i)$ 是斐波那契数 $1, 1, 2, 3, 5, 8, \dots$。

每个 $c_i$ 再连一条直达汇点 $t$ 的边，就会贡献 $f(c_i)$ 条路径。因此只要把 $K$ 表示成若干**互不相同的斐波那契数之和**，给这些层级加上直达 $t$ 的边即可。用从大到小的贪心（齐肯多夫分解）就能得到这样的表示：

$$K = \sum_{i \in S} f(c_i)$$

由于 $F_{44} = 701408733 < 10^9 < F_{45} = 1134903170$，最高只用得到第 43 层，总点数不超过 $45 \le 50$。且所有边都从编号小的点指向编号大的点，图天然是 DAG，也没有重边。

## 复杂度

每个测试点生成约 44 个斐波那契数并做一次贪心，时间 $O(\log K)$，输出规模 $O(\log K)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

// 斐波那契链构造：c_0、c_1 的路径数 f = 1，之后 f(c_i) = f(c_{i-1}) + f(c_{i-2})
// 对 K 做贪心（齐肯多夫）分解：选中层级 i 就加一条 c_i -> t 的边
// 总路径数 = 所有选中层级 f 值之和 = K；点数 = maxLevel + 2 <= 45 <= 50

func build(reader: ConsoleReader): Unit {
    let k = Int64.parse(reader.readln().getOrThrow())
    // 生成不超过 1e9 的斐波那契数列：fib[0] = fib[1] = 1
    var fib = Array<Int64>(60, { _ => 0 })
    fib[0] = 1
    fib[1] = 1
    var len: Int64 = 2
    while (len < 60 && fib[len - 1] + fib[len - 2] <= 1000000000) {
        fib[len] = fib[len - 1] + fib[len - 2]
        len += 1
    }
    // 从大到小贪心选择层级
    var chosen = Array<Bool>(len, { _ => false })
    var rem = k
    var j = len - 1
    while (j >= 0) {
        if (rem > 0 && fib[j] <= rem) {
            chosen[j] = true
            rem -= fib[j]
        }
        j -= 1
    }
    var maxLevel: Int64 = 0
    var l: Int64 = 0
    while (l < len) {
        if (chosen[l]) {
            maxLevel = l
        }
        l += 1
    }
    let t = maxLevel + 2
    // 统计边数
    var cnt: Int64 = 0
    if (maxLevel >= 1) {
        cnt += 1
    }
    var lv: Int64 = 2
    while (lv <= maxLevel) {
        cnt += 2
        lv += 1
    }
    l = 0
    while (l < len) {
        if (chosen[l]) {
            cnt += 1
        }
        l += 1
    }
    println("${t} ${cnt}")
    if (maxLevel >= 1) {
        println("1 2")
    }
    lv = 2
    while (lv <= maxLevel) {
        println("${lv} ${lv + 1}")
        println("${lv - 1} ${lv + 1}")
        lv += 1
    }
    l = 0
    while (l < len) {
        if (chosen[l]) {
            println("${l + 1} ${t}")
        }
        l += 1
    }
}

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    var i: Int64 = 0
    while (i < t) {
        build(reader)
        i += 1
    }
}
```

</details>

---
oj: dmy
pid: '218'
title: '[R36C]画廊'
difficulty: 提高
tags:
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> $1 \leq n \leq 2 \times 10^5$，$1 \leq a_i \leq n$，$1 \leq b_i \leq c_i \leq 10^9$。

## 思路

先想清楚每幅画最终的归属：每幅画要么留在原挂钩 $a_i$ 上付保养费 $b_i$，要么被移走付一次性搬运费 $c_i$，到了新挂钩无需再付费。因此每幅画的费用只取决于「留还是走」，与被搬到哪无关。

设挂钩 $h$ 上当前有 $\text{count}_h$ 幅画。最终每个挂钩恰有一幅画，而画总数为 $n$，于是：

- $\text{count}_h \geq 1$ 的挂钩恰有一幅画 **留下**（付 $b$），其余画被移走（付 $c$）；
- $\text{count}_h = 0$ 的挂钩没有画可留，它被一幅移来的画占据，那幅画付了 $c$。

由于 $\sum \text{count}_h = n$，而被留下的画数等于 $\text{count}_h \geq 1$ 的挂钩数，恰好等于 $n - (\text{count}_h = 0 \text{ 的挂钩数})$，与空挂钩数一致，方案总是可行。

于是问题变成：**对每个非空挂钩，在其上的画中选一幅「留下」，其余全部移走**，最小化总费用。

把所有画的总费用写成「全部移走」再减去「留下一幅所节省的金额」：

$$\text{答案} = \sum_i c_i - \sum_{\text{count}_h \geq 1} \max_{i : a_i = h}(c_i - b_i)$$

因为 $b_i \leq c_i$，所以 $c_i - b_i \geq 0$，留下任意一幅总能省钱；要让总费用最小，就在每个非空挂钩里挑 $c_i - b_i$ 最大的那幅留下。注意这里不能贪 $b_i$ 最小：节省量是 $c_i - b_i$，与 $b_i$ 不等价。

## 复杂度

按挂钩分组遍历一次，每个挂钩线性扫描求最大值。时间 $\mathcal{O}(n)$，空间 $\mathcal{O}(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*
import std.collection.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())

    // 用 HashMap 把画按挂钩 a_i 分组（值是 ArrayList<Int64>），存 (c_i - b_i)
    // 与 n+1 大小数组等价，但挂钩编号在 1..n，用 ArrayList 数组更省事且够快。
    let nbuckets = n
    var buckets = Array<ArrayList<Int64>>(nbuckets, { _ => ArrayList<Int64>() })

    var totalC: Int64 = 0
    for (_ in 0..n) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let a = Int64.parse(parts[0])
        let b = Int64.parse(parts[1])
        let c = Int64.parse(parts[2])
        totalC += c
        // 该画若留在原挂钩，相比移走可节省 (c - b)
        buckets[a - 1].add(c - b)
    }

    var saved: Int64 = 0
    var i = 0
    while (i < nbuckets) {
        let lst = buckets[i]
        if (lst.size > 0) {
            // 该挂钩非空，恰好留一幅；选能节省最多的那幅
            var best: Int64 = lst[0]
            var j = 1
            let sz = lst.size
            while (j < sz) {
                let v = lst[j]
                if (v > best) {
                    best = v
                }
                j += 1
            }
            saved += best
        }
        i += 1
    }

    println("${totalC - saved}")
}
```

</details>

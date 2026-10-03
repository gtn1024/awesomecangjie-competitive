---
oj: dmy
pid: '277'
title: '[R45C]会议和沙威玛'
difficulty: 提高
tags:
  - 离散化
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \leq T \leq N \le 2\times 10^5$，$0 \leq a_i, b_i \le 10^9$。其中 $N$ 为所有问题 $n$ 的和。

## 思路

题面要求判断两个序列 $a, b$ 是否「本质相同」，即对所有 $i, j$ 都有 $a_i < a_j \Leftrightarrow b_i < b_j$。这等价于 **两个序列的相对大小关系完全一致**。

把「相对大小关系」具象化的标准做法是 **离散化**：对每个序列，把它出现过的所有值去重并排序，再把原序列里每个元素替换成它在去重后有序表中的序号（相同值取相同序号）。这样得到的名次序列 $r_a, r_b$ 只保留了「谁比谁大」这一层信息，把绝对数值的差距抹平了。

> 例如 $a = (1, 2, 3, 4, 5)$ 离散化为 $r_a = (0, 1, 2, 3, 4)$；$b = (5, 4, 3, 2, 1)$ 离散化为 $r_b = (4, 3, 2, 1, 0)$。两者不相等，故 `No`。

关键命题是：**$a, b$ 本质相同 $\Leftrightarrow$ $r_a = r_b$**（逐元素相等）。

- 必要性：若 $a, b$ 本质相同，则 $a_i < a_j$ 与 $b_i < b_j$ 同步成立，相同值也同步相等。于是把 $a$ 中元素按从小到大编号时，$a_i$ 拿到的编号与 $b_i$ 拿到的编号必然一致，即 $r_a = r_b$。
- 充分性：若 $r_a = r_b$，则 $a_i < a_j \Leftrightarrow r_{a,i} < r_{a,j} \Leftrightarrow r_{b,i} < r_{b,j} \Leftrightarrow b_i < b_j$，相对大小关系完全一致。

实现上，对每个序列：拷贝一份排序，用哈希表把每个值映射到它在去重有序表中的序号，再遍历原序列查表填出名次序列。最后逐位比较 $r_a, r_b$ 即可。

## 复杂度

设 $N$ 为所有问题 $n$ 的和。每组问题的排序与哈希表构建为 $O(n \log n)$，查询为 $O(n)$，总计 $O(N \log N)$，时间足够。空间上每组释放，峰值为单组 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.collection.*
import std.sort.*

// 将序列 a 离散化为名次序列（相同值同名次，从 0 开始），结果写入 out
// 名次定义：a[i] 在去重升序后的序号
func discretize(a: Array<Int64>, out: Array<Int64>): Unit {
    let n = a.size
    // 拷贝并排序去重
    let sorted = Array<Int64>(n, { i: Int64 => a[i] })
    sort(sorted)
    // 建立值 -> 名次 映射
    let map = HashMap<Int64, Int64>()
    var rank: Int64 = 0
    var i = 0
    while (i < n) {
        let v = sorted[i]
        if (!map.contains(v)) {
            map[v] = rank
            rank = rank + 1
        }
        i = i + 1
    }
    // 对每个元素查映射
    for (k in 0..n) {
        out[k] = map[a[k]]
    }
}

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        let n = Int64.parse(reader.readln().getOrThrow())
        let nn = n
        let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let ra = Array<Int64>(nn, { _ => 0 })
        let rb = Array<Int64>(nn, { _ => 0 })
        discretize(a, ra)
        discretize(b, rb)
        var same = true
        for (k in 0..nn) {
            if (ra[k] != rb[k]) {
                same = false
                break
            }
        }
        if (same) {
            println("Yes")
        } else {
            println("No")
        }
    }
}
```

</details>

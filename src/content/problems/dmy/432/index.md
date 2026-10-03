---
oj: dmy
pid: '432'
title: '[R69F] 数组相同'
difficulty: 普及+/提高
tags:
  - 构造
  - 折半枚举
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 40$，$-10^7 \le a_i, b_i \le 10^7$。

## 思路

先分析两种操作的实质。

对序列 $A$ 的操作给相邻两个位置同时加上同一个 $k$，因此 **“奇偶交替和”**

$$
S_A = a_1 - a_2 + a_3 - a_4 + \cdots
$$

保持不变；反过来，$n-1$ 个相邻加操作张成的空间恰好是“交替和为零”的全体序列（等价于相邻差分的逐步调整），所以 $A$ 可以变成任意一个交替和等于 $S_A$ 的序列。

对序列 $B$ 的操作只是交换相邻元素，可以把 $B$ 变成任意排列，且总和 $S_B = \sum b_i$ 不变。

于是问题等价于：是否存在一个 $B$ 的排列，使它的交替和恰好等于 $S_A$。奇数位置共有 $t = \lceil n/2 \rceil$ 个，若放在奇数位的数之和为 $X$，偶数位的数之和为 $S_B - X$，则该排列的交替和为：

$$
X - (S_B - X) = 2X - S_B
$$

要让它等于 $S_A$，即 $2X - S_B = S_A$，解得：

$$
X = \frac{S_A + S_B}{2}
$$

所以只需判断能否从 $B$ 中选出恰好 $t$ 个数，使它们的和等于 $X$。若 $S_A + S_B$ 是奇数则直接无解。

剩下的问题是“选固定个数、固定总和”的子集和问题。$n \le 40$，直接枚举组合最多有 $\binom{40}{20}$ 种，不可行，需要用**折半枚举**：

1. 把 $B$ 分成前后两半，各至多 $20$ 个元素；
2. 枚举左半所有子集，把“选中的个数 $c$、总和 $s$”按个数 $c$ 分组存入哈希表；
3. 枚举右半所有子集，对每个（个数 $c_2$、总和 $s_2$），在左半的哈希表里查找是否存在个数为 $t - c_2$、总和为 $X - s_2$ 的子集。

存在这样的划分即可通过相邻交换排出 $B$，再用 $A$ 的操作对齐两个序列，输出 `Yes`。

## 复杂度

时间 $O(2^{n/2})$，空间 $O(2^{n/2})$（最坏 $n = 40$ 时各 $2^{20}$）。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.collection.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    var sumA: Int64 = 0
    for (i in 0..n) {
        if (i % 2 == 0) {
            sumA += a[i]
        } else {
            sumA -= a[i]
        }
    }
    var sumB: Int64 = 0
    for (x in b) {
        sumB += x
    }

    if ((sumA + sumB) % 2 != 0) {
        println("No")
        return
    }
    let x = (sumA + sumB) / 2
    let t = (n + 1) / 2
    let k = n / 2
    let nn = n

    // 枚举左半部分（下标 0..k-1）的所有子集，按选中个数存和
    let sets = Array<HashSet<Int64>>(k + 1, { _ => HashSet<Int64>() })
    for (mask in 0..(1 << k)) {
        var cnt = 0
        var sum: Int64 = 0
        var m = mask
        var idx = 0
        while (m > 0) {
            if (m % 2 == 1) {
                sum += b[idx]
                cnt += 1
            }
            idx += 1
            m /= 2
        }
        sets[cnt].add(sum)
    }

    // 枚举右半部分（下标 k..n-1）的所有子集，查左半能否补齐
    let r = nn - k
    for (mask in 0..(1 << r)) {
        var cnt = 0
        var sum: Int64 = 0
        var m = mask
        var idx = k
        while (m > 0) {
            if (m % 2 == 1) {
                sum += b[idx]
                cnt += 1
            }
            idx += 1
            m /= 2
        }
        let c1 = t - cnt
        if (c1 >= 0 && c1 <= k && sets[c1].contains(x - sum)) {
            println("Yes")
            return
        }
    }
    println("No")
}
```

</details>

要点：

- 左半子集按选中个数分组存进 `HashSet`，右半枚举时以 $O(1)$ 的 `contains` 完成合并查询，避免排序后二分带来的额外 $\log$ 因子；
- 子集用掩码枚举，逐位取出元素累加个数与总和，单次枚举 $O(2^{n/2})$；
- 和的最大绝对值不超过 $40 \times 10^7$，`Int64` 足够，无需取模。

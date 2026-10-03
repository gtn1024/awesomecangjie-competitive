---
oj: dmy
pid: '175'
title: '[R29B]最少修改'
difficulty: 入门
tags:
  - 模拟
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le k \le n \le 10^5$，$1 \le A_i \le 10^5$。

## 思路

题目要求修改后的数组中每个数字的出现次数都不超过 $k$。考虑某个数字 $x$，设它在原数组中共出现 $c$ 次：

- 若 $c \le k$，$x$ 已经满足条件，无需修改。
- 若 $c > k$，为了让 $x$ 的出现次数降到 $k$，至少要把 $c - k$ 个 $x$ 改成别的值。

把被修改的元素改成什么？可以改成原数组中已经出现但次数还没到 $k$ 的值，也可以改成完全没出现过的值（取值范围无穷大，总能找到）。因此被修改的元素总能在不破坏其他数字限制的前提下「被消化掉」，每个超出 $k$ 的数字对答案的贡献就是 $c - k$，各数字之间互不影响。

所以答案就是把所有 $c > k$ 的数字的超额部分累加起来：

$$\text{ans} = \sum_{x}\max(0,\,\text{cnt}[x] - k)$$

## 复杂度

时间 $O(n + V)$，其中 $V = 10^5$ 为值域；空间 $O(V)$。直接用频率数组统计即可。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line[0]
    let k = line[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // A_i <= 1e5，用频率数组统计出现次数
    let maxV: Int64 = 100001
    let cnt = Array<Int64>(maxV, { _ => 0 })
    for (x in a) {
        cnt[x] += 1
    }

    // 对每个出现次数 c > k 的数，需修改 c - k 个
    var ans: Int64 = 0
    for (i in 0..maxV) {
        if (cnt[i] > k) {
            ans += cnt[i] - k
        }
    }
    println(ans)
}
```

</details>

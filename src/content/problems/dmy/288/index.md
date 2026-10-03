---
oj: dmy
pid: '288'
title: '[R46G]贪吃鬼'
difficulty: 提高+
tags:
  - 动态规划
  - 计数
  - 组合数学
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$2 \le n \le 3000$，$1 \le m \le 10^9$。

## 思路

首先刻画哪些序列能够被吃完。

一个序列能够被吃完，当且仅当它能被划分成若干个连续段，并且每一段的首尾颜色相同。

- 如果已经有这样的划分，逐段选择首尾两个糖果，就能直接吃掉整段。
- 反过来，考虑某种合法操作方案的最后一次操作。设它选择了原序列中位置 $l,r$ 的两个糖果，那么 $a_l=a_r$。位置 $l$ 左侧和位置 $r$ 右侧的糖果都必须在此之前分别被吃完，否则最后一次操作无法吃掉它们；任何更早的操作也不能跨过 $l$ 或 $r$，否则会提前吃掉最后一次操作的端点。因此左右两侧都是合法序列，递归划分后，再加入区间 $[l,r]$，便得到上述划分。

于是问题变成统计有多少个序列能划分成若干个首尾同色的连续段。直接按划分位置计数会重复统计，需要为每个序列选取唯一状态。

对于一个已经处理的后缀 $w$，定义集合 $C(w)$：若 $w$ 中某个位置的颜色为 $c$，并且该位置之后的后缀合法，就把颜色 $c$ 加入 $C(w)$。空序列视为合法。

在 $w$ 前面加入一个颜色为 $x$ 的糖果：

- 新序列 $xw$ 合法，当且仅当 $x\in C(w)$。因为第一段必须从新加入的糖果开始，并在某个同色位置结束，而该位置之后还必须是合法后缀。
- 如果 $w$ 合法，新加入的位置也能作为以后某一段的右端点，所以 $C(xw)=C(w)\cup\{x\}$；如果 $w$ 不合法，则 $C(xw)=C(w)$。

颜色的具体编号不重要，只需记录集合大小。令：

- $f_{i,k}$ 表示长度为 $i$、自身合法且 $|C|=k$ 的后缀数量；
- $g_{i,k}$ 表示长度为 $i$、自身不合法且 $|C|=k$ 的后缀数量。

初始时空后缀合法，故 $f_{0,0}=1$。从长度 $i$ 转移到 $i+1$ 时，若新颜色属于 $C$，有 $k$ 种选择；否则有 $m-k$ 种选择：

$$
\begin{aligned}
f_{i+1,k} &\mathrel{+}= k(f_{i,k}+g_{i,k}),\\
g_{i+1,k} &\mathrel{+}= (m-k)g_{i,k},\\
g_{i+1,k+1} &\mathrel{+}= (m-k)f_{i,k}.
\end{aligned}
$$

最终答案为 $\sum_k f_{n,k}$。使用滚动数组保存相邻两层即可。

## 复杂度

时间复杂度 $O(n^2)$，空间复杂度 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

const MOD: Int64 = 1000000007

main() {
    let reader = getStdIn()
    let input = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = input[0]
    let m = input[1]
    let size = n + 2

    // good[k] / bad[k]：当前后缀合法 / 不合法，且接续颜色集合大小为 k 的方案数
    var good = Array<Int64>(size, { _ => 0 })
    var bad = Array<Int64>(size, { _ => 0 })
    var nextGood = Array<Int64>(size, { _ => 0 })
    var nextBad = Array<Int64>(size, { _ => 0 })
    good[0] = 1

    var len: Int64 = 0
    while (len < n) {
        let limit = if (len < m) { len } else { m }
        var k: Int64 = 0
        while (k <= limit + 1) {
            nextGood[k] = 0
            nextBad[k] = 0
            k = k + 1
        }

        k = 0
        while (k <= limit) {
            let inside = k
            let outside = m - k
            nextGood[k] = (nextGood[k] + (good[k] + bad[k]) % MOD * inside) % MOD
            nextBad[k] = (nextBad[k] + bad[k] * outside) % MOD
            nextBad[k + 1] = (nextBad[k + 1] + good[k] * outside) % MOD
            k = k + 1
        }

        let tempGood = good
        good = nextGood
        nextGood = tempGood
        let tempBad = bad
        bad = nextBad
        nextBad = tempBad
        len = len + 1
    }

    let limit = if (n < m) { n } else { m }
    var answer: Int64 = 0
    var k: Int64 = 0
    while (k <= limit) {
        answer = (answer + good[k]) % MOD
        k = k + 1
    }
    println(answer)
}
```

</details>

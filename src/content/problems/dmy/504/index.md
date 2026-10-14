---
oj: dmy
pid: '504'
title: 长跳跃
difficulty: 普及−
tags:
  - 线性DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le T \le 1000$，所有测试用例的 $n$ 之和不超过 $2 \times 10^5$，$1 \le a_i \le n$。

## 思路

蜗蜗站在第 $i$ 个格子时**只有一个选择**：跳到第 $i + a_i$ 个格子，所以从每个起点出发的路径都是唯一确定的，唯一要做的就是在所有起点里挑出得分最大的那个。

设 $dp_i$ 表示从第 $i$ 个格子出发（把站在 $i$ 上、跳出 $i$ 时得到的 $a_i$ 分也算进去）能获得的总分。由于 $a_i \ge 1$，落点满足 $i + a_i > i$，$dp_i$ 只依赖下标比它大的状态：

$$dp_i = a_i + \begin{cases} dp_{i+a_i}, & i + a_i \le n \\ 0, & i + a_i > n \end{cases}$$

从 $n$ 到 $1$ 倒序递推，一次遍历就能算出所有 $dp_i$。

**答案不是 $dp_1$**，而是 $\max_{1 \le i \le n} dp_i$：题目问的是「从任意一个格子出发」的最大总分，起点也属于选择的一部分，因此递推时顺手维护最大值即可。

分值规模上，一条路径最多跳 $n$ 次、每次至多得 $n$ 分，总分可达 $n^2 = 4 \times 10^{10}$，必须用 64 位整数存 $dp$。

## 复杂度

每组数据时间 $O(n)$、空间 $O(n)$，所有测试用例合计 $O\left(\sum n\right)$。

## 仓颉实现

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

main() {
    gdata = getStdIn().readToEnd().getOrThrow().toArray()
    var t = nextInt()
    while (t > 0) {
        t -= 1
        let n = nextInt()
        let nn = n
        let a = Array<Int64>(nn + 2, { _ => 0 })
        let dp = Array<Int64>(nn + 2, { _ => 0 })
        var i: Int64 = 1
        while (i <= nn) {
            a[i] = nextInt()
            i += 1
        }
        var best: Int64 = 0
        i = nn
        while (i >= 1) {
            var v = a[i]
            let j = i + a[i]
            if (j <= nn) {
                v += dp[j]
            }
            dp[i] = v
            if (v > best) {
                best = v
            }
            i -= 1
        }
        println(best)
    }
}
```

</details>

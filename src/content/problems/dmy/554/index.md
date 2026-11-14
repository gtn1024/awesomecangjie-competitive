---
oj: dmy
pid: '554'
title: 石头剪刀布 3
difficulty: 普及
tags:
  - 线性 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le N \le 2\times 10^5$，$S$ 只含 `R`、`P`、`S`。

## 思路

**每轮的备选只有两个。** 「不能输」意味着蜗蜗的手势只能是「赢朋友的那个」或「与朋友相同的那个」，且这两者必然互不相同。把石头、布、剪刀编号为 $0,1,2$：朋友出 `R` 时可选 `P`（胜）与 `R`（平），出 `P` 时可选 `S` 与 `P`，出 `S` 时可选 `R` 与 `S`。

**状态。** 「相邻两轮手势不同」是只涉及相邻两轮的局部约束，因此决定后续的全部历史信息只有「上一轮出了什么」。设 $dp_i(g)$ 表示前 $i$ 轮、且第 $i$ 轮出 $g$ 时的最大胜场数；若 $g$ 在第 $i$ 轮不可选，则令其值为 $-\infty$。

**转移。** 枚举上一轮的手势 $h$，取与当前 $g$ 不同的那些：

$$dp_i(g)=\max_{h\ne g} dp_{i-1}(h)+[\,g \text{ 胜}\,],$$

其中 $[\,g \text{ 胜}\,]$ 为 $1$ 当且仅当 $g$ 战胜 $S_i$，否则为 $0$（此时 $g$ 与朋友的出手相同，是平局）。第 $i$ 轮只在 $g$ 属于该轮的两个备选手势时做上述计算，其余位置保持 $-\infty$。

**边界。** 第一轮没有「上一轮」的约束，等价于虚拟的第 $0$ 轮取值为 $0$；实现上把 $\max_{h\ne g}dp_0(h)$ 视为 $0$ 即可。最终答案为 $\max_g dp_N(g)$。

**正确性。** 由于约束只涉及相邻两层、每层只有三种取值，任意一条合法出手序列都对应唯一的一条状态路径，且其得分恰为路径上 $[\,g \text{ 胜}\,]$ 之和；反过来每条状态路径都能还原成合法的出手序列。故 $dp$ 取到的最大值就是答案。

## 复杂度

每轮只有两种备选手势，每种至多枚举 $3$ 种上一轮手势，时间 $O(N)$；滚动数组只保留 $3$ 个状态，空间 $O(1)$（输入字符串本身占 $O(N)$）。

## 仓颉实现

用 `toRuneArray()` 取出字符后按下标遍历，读入时跳过非 `R`/`P`/`S` 的字符。

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

func winOf(c: Rune): Int64 {
    if (c == r'R') {
        return 1
    }
    if (c == r'P') {
        return 2
    }
    return 0
}

func tieOf(c: Rune): Int64 {
    if (c == r'R') {
        return 0
    }
    if (c == r'P') {
        return 1
    }
    return 2
}

main() {
    let n = Int64.parse(getStdIn().readln().getOrThrow())
    let s = getStdIn().readln().getOrThrow()
    let runes = s.toRuneArray()
    let total = if (Int64(runes.size) < n) {
        Int64(runes.size)
    } else {
        n
    }
    let NEG: Int64 = -1000000000
    var prev = Array<Int64>(3, { _ => NEG })
    var started = false
    for (i in 0..total) {
        let c = runes[i]
        if (c != r'R' && c != r'P' && c != r'S') {
            continue
        }
        let tie = tieOf(c)
        let win = winOf(c)
        var cur = Array<Int64>(3, { _ => NEG })
        for (g in [tie, win]) {
            var best: Int64 = 0
            if (started) {
                best = NEG
                for (h in 0..3) {
                    if (h != g && prev[h] > best) {
                        best = prev[h]
                    }
                }
            }
            if (best != NEG) {
                cur[g] = best + (if (g == win) { 1 } else { 0 })
            }
        }
        prev = cur
        started = true
    }
    var ans: Int64 = 0
    for (g in 0..3) {
        if (prev[g] > ans) {
            ans = prev[g]
        }
    }
    println(ans)
}
```

</details>

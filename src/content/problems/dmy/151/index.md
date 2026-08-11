---
oj: dmy
pid: '151'
title: '[R25D]假期活动'
difficulty: 提高
tags:
  - 动态规划
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$3 \le n \le 10^5$，$0 \le a_i, b_i, c_i \le 10^9$，$1 \le m \le 27$。

## 思路

题目本质是 **在所有长度为 $n$ 的活动序列上，求满足「无任何禁止连续三天子串」约束的最大幸福度和**。约束只涉及「连续三天」，是一个典型的、依赖有限历史的 DP。

把活动 $\mathrm{A/B/C}$ 编号为 $0/1/2$。一个长度为 $n$ 的合法序列前缀 $x_1 x_2 \dots x_i$ 在追加第 $i+1$ 天活动 $y$ 后是否仍合法，**只取决于**该前缀的最后两天 $x_{i-1}, x_i$ 以及 $y$，即检查三元组 $(x_{i-1}, x_i, y)$ 是否落在禁止集中。因此只需要把「最后两天的活动选择」作为 DP 状态即可承载全部约束信息。

定义：

$$
\mathrm{dp}[a][b] = \text{在当前天数 } i \text{ 下，第 } i-1 \text{ 天选活动 } a \text{、第 } i \text{ 天选活动 } b \text{ 时，前 } i \text{ 天的最大幸福度和}
$$

状态数为 $3 \times 3 = 9$。转移时枚举前一天的状态 $(p, q)$ 与今天的新选择 $x$：

- 合法性：若禁止集 $\mathrm{ban}[p][q][x]$ 为真，则跳过；
- 否则 $\mathrm{ndp}[q][x] \gets \max(\mathrm{ndp}[q][x],\ \mathrm{dp}[p][q] + \mathrm{happy}[i][x])$。

注意新状态的「最后两天」是 $(q, x)$，而不是 $(p, q)$，因为 $p$ 已被推出窗口外。

**初始化**：前两天没有「连续三天」的概念，可直接枚举第 $1$ 天活动 $a$ 与第 $2$ 天活动 $b$：

$$
\mathrm{dp}[a][b] = \mathrm{happy}[1][a] + \mathrm{happy}[2][b]
$$

从第 $3$ 天（下标 $2$）开始按上述转移滚动推进。

**答案**：取 $\max_{a, b} \mathrm{dp}[a][b]$；若所有状态都仍是初始的 $-\infty$（即无法构造任何合法序列），输出 $-1$。本题保证 $n \ge 3$ 且每天三种幸福度非负，通常一定有解；但实现上仍需用一个足够小的「负无穷」哨兵值来标识不可达状态，避免误把无效状态当成答案。

禁止集用一个三维布尔数组 $\mathrm{ban}[3][3][3]$ 即可，读入字符串后逐字符映射为 $0/1/2$ 写入。

## 复杂度

- 时间：$O(n \cdot 9 \cdot 3) = O(n)$，约 $2.7 \times 10^6$ 次常数级操作。
- 空间：$O(n)$，存每天的 $3$ 个幸福度；DP 表与禁止集均为常数大小。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()

    // 假期天数
    let n = Int64.parse(reader.readln().getOrThrow())

    // 每天三种活动的幸福度
    let ha = Array<Int64>(n, { _ => 0 })
    let hb = Array<Int64>(n, { _ => 0 })
    let hc = Array<Int64>(n, { _ => 0 })
    var i: Int64 = 0
    while (i < n) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        ha[i] = Int64.parse(parts[0])
        hb[i] = Int64.parse(parts[1])
        hc[i] = Int64.parse(parts[2])
        i++
    }
    // 合并为 happy[i][x]，x∈{0,1,2} 表示 A/B/C
    let happy = Array<Array<Int64>>(n, { _ => Array<Int64>(3, { _ => 0 }) })
    var k: Int64 = 0
    while (k < n) {
        happy[k][0] = ha[k]
        happy[k][1] = hb[k]
        happy[k][2] = hc[k]
        k++
    }

    // 禁止集 ban[a][b][c] = true 表示连续三天 (a,b,c) 被禁
    let ban = Array<Array<Array<Bool>>>(3, { _ =>
        Array<Array<Bool>>(3, { _ => Array<Bool>(3, { _ => false }) }) })
    let m = Int64.parse(reader.readln().getOrThrow())
    var j: Int64 = 0
    while (j < m) {
        let s = reader.readln().getOrThrow()
        let arr = s.toRuneArray()
        ban[idx(arr[0])][idx(arr[1])][idx(arr[2])] = true
        j++
    }

    // dp[a][b] = 前 i 天中第 i-1 天活动 a、第 i 天活动 b 的最大幸福度
    let NEG = Int64.Min / 4
    var dp = Array<Array<Int64>>(3, { _ => Array<Int64>(3, { _ => NEG }) })
    // 初始化：前两天无三天约束
    var a0: Int64 = 0
    while (a0 < 3) {
        var b0: Int64 = 0
        while (b0 < 3) {
            dp[a0][b0] = happy[0][a0] + happy[1][b0]
            b0++
        }
        a0++
    }

    // 第 3 天起滚动转移
    var day: Int64 = 2
    while (day < n) {
        let ndp = Array<Array<Int64>>(3, { _ => Array<Int64>(3, { _ => NEG }) })
        var prev2: Int64 = 0
        while (prev2 < 3) {
            var prev1: Int64 = 0
            while (prev1 < 3) {
                let cur = dp[prev2][prev1]
                if (cur == NEG) {
                    prev1++
                    continue
                }
                var x: Int64 = 0
                while (x < 3) {
                    if (ban[prev2][prev1][x]) {
                        x++
                        continue
                    }
                    let val = cur + happy[day][x]
                    if (val > ndp[prev1][x]) {
                        ndp[prev1][x] = val
                    }
                    x++
                }
                prev1++
            }
            prev2++
        }
        dp = ndp
        day++
    }

    var ans: Int64 = NEG
    var p: Int64 = 0
    while (p < 3) {
        var q: Int64 = 0
        while (q < 3) {
            if (dp[p][q] > ans) {
                ans = dp[p][q]
            }
            q++
        }
        p++
    }

    if (ans == NEG) {
        println("-1")
    } else {
        println("${ans}")
    }
    return 0
}

// 字符 Rune -> 活动 0/1/2
func idx(c: Rune): Int64 {
    let u = UInt32(c)
    return Int64(u - UInt32(65))
}
```

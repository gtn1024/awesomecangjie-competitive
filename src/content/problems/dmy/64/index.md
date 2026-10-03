---
oj: dmy
pid: '64'
title: '[R11D] 山谷数'
difficulty: 提高
tags:
  - 枚举
  - 二分
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le q \le 3\times 10^5$，$1 \le L_i \le R_i \le 10^{18}$。

## 思路

把数位从低位到高位记为 $X_1, X_2, \dots, X_{len}$。山谷数要求首尾相等 $X_1 = X_{len}$，且存在谷底位置 $i$：$X_1 > X_2 > \dots > X_i$（严格递减到谷底），$X_i < X_{i+1} < \dots < X_{len}$（严格递增回顶端）。

换到常规（高位到低位）视角 $d_1 d_2 \dots d_L$：从最高位 $d_1$ 严格递减到谷底 $m = d_i$，再从谷底严格递增到末位 $d_L$，且 $d_1 = d_L$。由于两侧都严格单调，数字不能在「同一侧」重复，但同一数字可以同时出现在谷底左右两侧（如 $98765432123456789$）。

由于严格单调限制了可用数字，$10^{18}$ 以内的山谷数只有约 $11.65$ 万个，可以全部枚举出来排序。枚举方法：选定顶端数字 $d_1 \in [1,9]$、谷底 $m \in [0, d_1-1]$，中间候选数字集合 $S = \{m+1, \dots, d_1-1\}$。$S$ 中每个数字独立地决定「是否进左半」「是否进右半」（用 2 位编码），左半按降序拼在 $d_1$ 与 $m$ 之间、右半按升序拼在 $m$ 与 $d_1$ 之间，得到一个山谷数。位数不足 3 或超过 $10^{18}$ 的舍去。

询问用前缀差：$\text{ask}(R) - \text{ask}(L-1)$，其中 $\text{ask}(X)$ 为不超过 $X$ 的山谷数个数，用二分（upper_bound）在排序数组上 $O(\log m)$ 求得。

复杂度：预处理 $O(m\log m)$（$m \approx 1.17\times 10^5$），每次询问 $O(\log m)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*
import std.sort.*
import std.collection.*

main(): Int64 {
    let reader = getStdIn()
    let q = Int64.parse(reader.readln().getOrThrow())
    let nums = ArrayList<Int64>()
    for (d1 in 1..=9) {
        var m: Int64 = 0
        while (m < d1) {
            let S = ArrayList<Int64>()
            var x = m + 1
            while (x < d1) {
                S.add(x)
                x += 1
            }
            let ks = S.size
            // 每个中间数字 2 位: 位0=进左半, 位1=进右半
            var total: Int64 = 1
            var tk = 2 * ks
            while (tk > 0) {
                total *= 2
                tk -= 1
            }
            var mask: Int64 = 0
            while (mask < total) {
                let leftMid = ArrayList<Int64>()
                let rightMid = ArrayList<Int64>()
                var b = 0
                while (b < ks) {
                    if (((mask >> (2 * b)) & 1) != 0) {
                        leftMid.add(S[b])
                    }
                    if (((mask >> (2 * b + 1)) & 1) != 0) {
                        rightMid.add(S[b])
                    }
                    b += 1
                }
                sort(leftMid, descending: true)
                sort(rightMid)
                let digits = ArrayList<Int64>()
                digits.add(d1)
                for (e in leftMid) {
                    digits.add(e)
                }
                digits.add(m)
                for (e in rightMid) {
                    digits.add(e)
                }
                digits.add(d1)
                let L = digits.size
                if (L >= 3) {
                    var val: Int64 = 0
                    var ok = true
                    for (idx in 0..L) {
                        if (val > 100000000000000000) {
                            ok = false
                            break
                        }
                        val = val * 10 + digits[idx]
                    }
                    if (ok && val > 0 && val <= 1000000000000000000) {
                        nums.add(val)
                    }
                }
                mask += 1
            }
            m += 1
        }
    }
    var arr = Array<Int64>(nums.size, { i => nums[i] })
    sort(arr)
    func ask(X: Int64): Int64 {
        var l: Int64 = 0
        var r: Int64 = arr.size
        while (l < r) {
            let mid = (l + r) / 2
            if (arr[mid] <= X) {
                l = mid + 1
            } else {
                r = mid
            }
        }
        return l
    }
    for (_ in 0..q) {
        let lr = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
        let ans = ask(lr[1]) - ask(lr[0] - 1)
        println(ans)
    }
    return 0
}
```

</details>

要点：

- 山谷数的严格单调性限制了可用数字，$10^{18}$ 内总量不大，直接打表排序后二分。
- 中间数字可同时进左、右两半（如 $9\dots1\dots9$），所以用「2 位独立选择」而非「二分分配」。

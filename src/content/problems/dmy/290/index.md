---
oj: dmy
pid: '290'
title: '[R47B]进制迷踪'
difficulty: 普及
tags:
  - 模拟
  - 大整数
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据：$1 \le |s| \le 100$，$s$ 由数字与从 `A` 到 `F` 的大写字母组成，保证 $s$ 没有前导零。保证 $s$ 在至少一种进制下是合法的。

## 思路

对四种进制 $\{2, 8, 10, 16\}$ 逐一处理。对每个进制 $b$，先判断 $s$ 是否合法（每个字符的数值都小于 $b$），合法则按该进制把 $s$ 展开成数值，最后统计 **不同数值** 的个数。

判断合法时，先把字符映射成数值：`0`-`9` 对应 $0$-$9$，`A`-`F` 对应 $10$-$15$，其他字符（题面保证不出现）视为非法。

难点在于数值规模。$|s| \le 100$ 时，十六进制下数值可达 $16^{100} \approx 10^{120}$，远超 `Int64` 范围。因此需要用大整数模拟。

实现一个十进制大整数（用数组存储十进制位，低位在前）。对 $s$ 从左到右扫描，每位执行 `result = result * base + cv`，即一次「整体乘 $b$ 再加一个小常数」。由于 $b \le 16$、每位数值 $\le 15$，进位用 `Int64` 即可承载，逐位处理即可。

最后把每个合法进制下得到的大整数转成十进制字符串，放入 `HashSet` 去重，集合大小即为答案。

## 复杂度

四种进制各扫描一次 $s$。十六进制合法时大整数位数最多约 $121$ 位，每次「乘 $b$ 加常数」是 $O(\text{位数})$，整体 $O(|s| \cdot 121)$。时间 $O(|s|^2)$，空间 $O(|s|)$，对 $|s| \le 100$ 完全足够。

## 仓颉实现

```cangjie
import std.env.*
import std.collection.*

// 大数（十进制位，低位在前，每位 0-9）。
class BigNumber {
    var digits: ArrayList<Int64>

    init() {
        digits = ArrayList<Int64>()
    }

    // digits = result*base + cv （从零开始）。
    func mulAdd(base: Int64, cv: Int64): Unit {
        var carry: Int64 = cv
        var i: Int64 = 0
        while (i < digits.size) {
            var cur = digits[i] * base + carry
            digits[i] = cur % 10
            carry = cur / 10
            i += 1
        }
        while (carry > 0) {
            digits.add(carry % 10)
            carry = carry / 10
        }
    }

    // 转十进制字符串（去前导零，全零返回 "0"）。
    func toString(): String {
        if (digits.size == 0) {
            return "0"
        }
        var sb = StringBuilder()
        var i = digits.size - 1
        while (i >= 0) {
            sb.append(digits[i])
            i -= 1
        }
        return sb.toString()
    }
}

main(): Int64 {
    let reader = getStdIn()
    let s = reader.readln().getOrThrow()
    // 计算每个字节的数值（非法记为 -1）。ASCII 字节即可。
    let n = s.size
    var values = Array<Int64>(n, { _ => -1 })
    var idx = 0
    for (b in s) {
        var v: Int64
        let bi = Int64(b)
        if (bi >= 48 && bi <= 57) {
            v = bi - 48
        } else if (bi >= 65 && bi <= 70) {
            v = bi - 55
        } else {
            v = -1
        }
        values[idx] = v
        idx += 1
    }
    let bases = [2, 8, 10, 16]
    var results = ArrayList<String>()
    for (base in bases) {
        var ok = true
        var i = 0
        while (i < n) {
            if (values[i] < 0 || values[i] >= base) {
                ok = false
                break
            }
            i += 1
        }
        if (ok) {
            let bn = BigNumber()
            var j = 0
            while (j < n) {
                bn.mulAdd(Int64(base), values[j])
                j += 1
            }
            results.add(bn.toString())
        }
    }
    // 用 HashSet 精确去重。
    var seen = HashSet<String>()
    for (r in results) {
        seen.add(r)
    }
    println(seen.size)
    return 0
}
```

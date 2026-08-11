---
oj: dmy
pid: '287'
title: '[R46F]环操作'
difficulty: 提高
tags:
  - 贪心
  - 中位数
  - 差分
timeLimit: 1s
memoryLimit: 256m
---

## 题目

给定两个长度为 $n$ 的循环整数序列 $a$ 和 $b$。可以执行任意次操作：选择下标 $i$ 和整数 $x$（可为负），令 $a_i\mathrel{+}=x$，$a_{(i+1)\bmod n}\mathrel{+}=(-2x)$，$a_{(i+2)\bmod n}\mathrel{+}=x$，代价 $|x|$。目标是让 $a=b$，求最小总代价，无解输出 $-1$。

> 对于 $100\%$ 的数据，$1\le T\le 10000$，$1\le n\le 10^5$，$1\le \sum n\le 10^6$，$-5000\le a_i,b_i\le 5000$。

## 思路

把「在下标 $i$ 处做的所有操作」合并记作一个总操作值 $x_i$（每个位置的代价之和就是 $|x_i|$，总代价为 $\sum|x_i|$）。由于操作的差分模板是 $(1,-2,1)$，目标成立的充要条件是

$$
x_i-2x_{(i-1)\bmod n}+x_{(i-2)\bmod n}=b_i-a_i,\qquad i=0,\dots,n-1.
$$

记 $d_i=b_i-a_i$。

**做一阶差分降阶**：令 $y_i=x_i-x_{(i-1)\bmod n}$，则上式化为 $y_i-y_{(i-1)\bmod n}=d_i$。对下标求和立刻得到必要条件 $\sum_{i=0}^{n-1}d_i=0$（也就是 $\sum a_i=\sum b_i$）；不满足直接输出 $-1$。

满足后，可取特解 $y_0=0$，$y_i=\sum_{j=1}^{i}d_j$。注意 $y$ 本身可以整体平移一个常数 $c_y$（平移不改变 $y_i-y_{i-1}=d_i$），这会带来第二个自由度，用以保证还原出的 $x$ 仍是循环的。

**还原 $x$ 并补循环条件**：从 $x_0=0$ 开始，$x_i=x_{i-1}+y_i$。循环要求 $x_n=x_0$，即 $\sum_{i=0}^{n-1} y_i=0$。先用平移自由度满足它：取 $c_y=-\dfrac{\sum y_i}{n}$。由于操作值必须是整数，$\sum y_i$ 必须能被 $n$ 整除，否则无解输出 $-1$。把每个 $y_i$ 都加上 $c_y$ 后，重新累计得到一组循环整数特解 $x_0,x_1,\dots,x_{n-1}$（仍以 $x_0=0$ 为基准）。

**分析剩余自由度**：如果另一个解 $x'$ 满足同样的差分方程，则 $z=x'-x$ 满足 $z_i-2z_{i-1}+z_{i-2}=0$，即一阶差分 $z_i-z_{i-1}$ 为常数 $c$；循环条件 $\sum(z_i-z_{i-1})=0$ 强制 $nc=0$，故 $c=0$，$z$ 为常向量。所以解空间只有 **一个平移自由度** $x\to x+c$。

**最小化代价**：目标变成

$$
\min_{c\in\mathbb{Z}}\sum_{i=0}^{n-1}|x_i+c|,
$$

这是经典的中位数问题，取 $c=-\mathrm{median}(x)$，对排序后的 $x$ 取 $x_{n/2}$ 即可。

## 复杂度

- 时间复杂度：$O(n\log n)$ 每组（瓶颈为排序）。
- 空间复杂度：$O(n)$ 每组。

## 仓颉实现

```cangjie
import std.env.*
import std.sort.*

// 快速整型读取：一次性读入全部输入，按字节解析
class FastReader {
    let data: String
    var idx: Int64

    init(data: String) {
        this.data = data
        this.idx = 0
    }

    func nextInt(): Int64 {
        let n = Int64(data.size)
        while (idx < n && data[idx] <= 32u8) {
            idx += 1
        }
        var neg = false
        if (idx < n && data[idx] == 45u8) {
            neg = true
            idx += 1
        }
        var v: Int64 = 0
        while (idx < n && data[idx] >= 48u8 && data[idx] <= 57u8) {
            v = v * 10 + Int64(data[idx] - 48u8)
            idx += 1
        }
        if (neg) {
            v = -v
        }
        return v
    }
}

main(): Int64 {
    let reader = FastReader(getStdIn().readToEnd().getOrThrow())
    let t = reader.nextInt()
    let out = StringBuilder()
    for (_ in 0..t) {
        let n = reader.nextInt()
        // 设 x_i 为下标 i 处操作的值，则需 x_i - 2x_{i-1} + x_{i-2} = b_i - a_i
        let a = Array<Int64>(n, { _ => 0 })
        for (i in 0..n) {
            a[i] = reader.nextInt()
        }
        var sumD: Int64 = 0
        // 令 y_i = x_i - x_{i-1}，则 d_i = y_i - y_{i-1}
        // y[0] = 0, y[i] = y[i-1] + d[i]，Σd = 0 保证 (I-S)y = d 有整数解
        let y = Array<Int64>(n, { _ => 0 })
        var sumY: Int64 = 0
        var prevY: Int64 = 0
        for (i in 0..n) {
            let di = reader.nextInt() - a[i]
            sumD += di
            if (i >= 1) {
                prevY = prevY + di
                y[i] = prevY
                sumY += prevY
            }
        }
        if (sumD != 0) {
            out.append("-1\n")
            continue
        }
        // 还需 Σ(y + c) = 0 有整数 c（循环边界条件）
        if (sumY % n != 0) {
            out.append("-1\n")
            continue
        }
        let cy = -sumY / n
        // 还原一组特解 x：x[0] = 0, x[i] = x[i-1] + y[i] + cy
        let x = Array<Int64>(n, { _ => 0 })
        var prevX: Int64 = 0
        for (i in 1..n) {
            prevX = prevX + y[i] + cy
            x[i] = prevX
        }
        // 通解为 x + c，最小化 Σ|x_i + c|，c 取中位数
        sort(x)
        let m = x[n / 2]
        var ans: Int64 = 0
        for (i in 0..n) {
            var diff = x[i] - m
            if (diff < 0) {
                diff = -diff
            }
            ans += diff
        }
        out.append("${ans}\n")
    }
    print(out.toString())
    return 0
}
```
